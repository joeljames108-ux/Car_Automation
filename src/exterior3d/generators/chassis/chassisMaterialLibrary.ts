// ===========================================================================
// CHASSIS MATERIAL LIBRARY — 13 REALISTIC PBR METALLIC PRESETS
// ===========================================================================
// Automotive-grade material definitions for chassis structural components:
// 6061-T6 Aluminum, 4130 Chromoly, AISI 4340 Steel, Titanium Gr5,
// Carbon Fiber Prepreg, Inconel 718, Magnesium AZ91D, Boron Steel,
// Maraging Steel, APX-50 Carbon, Seamless Tubing Steel, Cast Iron, Epoxy Primer
// ===========================================================================
import * as THREE from 'three';

export interface ChassisMaterialPreset {
  name: string;
  category: 'aluminum' | 'steel' | 'titanium' | 'carbon' | 'nickel' | 'magnesium' | 'cast' | 'coating';
  material: THREE.MeshPhysicalMaterial;
  yieldStrengthMPa: number;
  tensileStrengthMPa: number;
  densityKgM3: number;
  elasticModulusGPa: number;
  thermalConductivityWmK: number;
  fatigueLifeCycles: number;
}

export class ChassisMaterialLibrary {
  private static _cache: Map<string, ChassisMaterialPreset> = new Map();

  static aluminum6061T6(): ChassisMaterialPreset {
    const c = this._cache.get('6061-T6 Aluminum'); if (c) return c;
    const m = new THREE.MeshPhysicalMaterial({
      name: '6061-T6 Aluminum',
      color: 0xb8c4d0,
      metalness: 0.92, roughness: 0.15,
      clearcoat: 0.6, clearcoatRoughness: 0.06,
      envMapIntensity: 1.4,
    });
    const p: ChassisMaterialPreset = {
      name: '6061-T6 Aluminum', category: 'aluminum', material: m,
      yieldStrengthMPa: 276, tensileStrengthMPa: 310,
      densityKgM3: 2700, elasticModulusGPa: 68.9,
      thermalConductivityWmK: 167, fatigueLifeCycles: 10000000,
    };
    this._cache.set('6061-T6 Aluminum', p);
    return p;
  }

  static chromolySteel4130(): ChassisMaterialPreset {
    const c = this._cache.get('4130 Chromoly Steel'); if (c) return c;
    const m = new THREE.MeshPhysicalMaterial({
      name: '4130 Chromoly Steel',
      color: 0x6a7480,
      metalness: 0.88, roughness: 0.22,
      clearcoat: 0.3, clearcoatRoughness: 0.1,
      envMapIntensity: 1.2,
    });
    const p: ChassisMaterialPreset = {
      name: '4130 Chromoly Steel', category: 'steel', material: m,
      yieldStrengthMPa: 460, tensileStrengthMPa: 560,
      densityKgM3: 7850, elasticModulusGPa: 205,
      thermalConductivityWmK: 42, fatigueLifeCycles: 5000000,
    };
    this._cache.set('4130 Chromoly Steel', p);
    return p;
  }

  static aISI4340Steel(): ChassisMaterialPreset {
    const c = this._cache.get('AISI 4340 Steel'); if (c) return c;
    const m = new THREE.MeshPhysicalMaterial({
      name: 'AISI 4340 Steel',
      color: 0x5a6570,
      metalness: 0.9, roughness: 0.18,
      clearcoat: 0.4, clearcoatRoughness: 0.08,
      envMapIntensity: 1.3,
    });
    const p: ChassisMaterialPreset = {
      name: 'AISI 4340 Steel', category: 'steel', material: m,
      yieldStrengthMPa: 710, tensileStrengthMPa: 1080,
      densityKgM3: 7850, elasticModulusGPa: 205,
      thermalConductivityWmK: 44, fatigueLifeCycles: 3000000,
    };
    this._cache.set('AISI 4340 Steel', p);
    return p;
  }

  static titaniumGr5Ti6Al4V(): ChassisMaterialPreset {
    const c = this._cache.get('Titanium Gr5 (Ti-6Al-4V)'); if (c) return c;
    const m = new THREE.MeshPhysicalMaterial({
      name: 'Titanium Gr5 (Ti-6Al-4V)',
      color: 0x9ca3af,
      metalness: 0.95, roughness: 0.12,
      clearcoat: 0.7, clearcoatRoughness: 0.04,
      envMapIntensity: 1.6,
      sheen: 0.3, sheenColor: new THREE.Color(0x6b9bd2), sheenRoughness: 0.2,
    });
    const p: ChassisMaterialPreset = {
      name: 'Titanium Gr5 (Ti-6Al-4V)', category: 'titanium', material: m,
      yieldStrengthMPa: 880, tensileStrengthMPa: 950,
      densityKgM3: 4430, elasticModulusGPa: 113.8,
      thermalConductivityWmK: 6.7, fatigueLifeCycles: 10000000,
    };
    this._cache.set('Titanium Gr5 (Ti-6Al-4V)', p);
    return p;
  }

  static carbonFiberPrepregT700(): ChassisMaterialPreset {
    const c = this._cache.get('Carbon Fiber Prepreg (T700)'); if (c) return c;
    const m = new THREE.MeshPhysicalMaterial({
      name: 'Carbon Fiber Prepreg (T700)',
      color: 0x0a0e18,
      metalness: 0.35, roughness: 0.18,
      clearcoat: 0.95, clearcoatRoughness: 0.03,
      envMapIntensity: 1.3,
      sheen: 0.4, sheenColor: new THREE.Color(0x1a2030), sheenRoughness: 0.3,
    });
    const p: ChassisMaterialPreset = {
      name: 'Carbon Fiber Prepreg (T700)', category: 'carbon', material: m,
      yieldStrengthMPa: 2100, tensileStrengthMPa: 3500,
      densityKgM3: 1580, elasticModulusGPa: 135,
      thermalConductivityWmK: 7, fatigueLifeCycles: 100000000,
    };
    this._cache.set('Carbon Fiber Prepreg (T700)', p);
    return p;
  }

  static inconel718(): ChassisMaterialPreset {
    const c = this._cache.get('Inconel 718'); if (c) return c;
    const m = new THREE.MeshPhysicalMaterial({
      name: 'Inconel 718',
      color: 0x888078,
      metalness: 0.9, roughness: 0.18,
      clearcoat: 0.5, clearcoatRoughness: 0.08,
      envMapIntensity: 1.3,
    });
    const p: ChassisMaterialPreset = {
      name: 'Inconel 718', category: 'nickel', material: m,
      yieldStrengthMPa: 1035, tensileStrengthMPa: 1240,
      densityKgM3: 8190, elasticModulusGPa: 205,
      thermalConductivityWmK: 11.4, fatigueLifeCycles: 5000000,
    };
    this._cache.set('Inconel 718', p);
    return p;
  }

  static magnesiumAZ91D(): ChassisMaterialPreset {
    const c = this._cache.get('Magnesium AZ91D'); if (c) return c;
    const m = new THREE.MeshPhysicalMaterial({
      name: 'Magnesium AZ91D',
      color: 0xc8c0b0,
      metalness: 0.88, roughness: 0.25,
      clearcoat: 0.3, clearcoatRoughness: 0.12,
      envMapIntensity: 1.1,
    });
    const p: ChassisMaterialPreset = {
      name: 'Magnesium AZ91D', category: 'magnesium', material: m,
      yieldStrengthMPa: 150, tensileStrengthMPa: 260,
      densityKgM3: 1810, elasticModulusGPa: 45,
      thermalConductivityWmK: 72, fatigueLifeCycles: 2000000,
    };
    this._cache.set('Magnesium AZ91D', p);
    return p;
  }

  static boronSteel22MnB5(): ChassisMaterialPreset {
    const c = this._cache.get('Boron Steel (22MnB5)'); if (c) return c;
    const m = new THREE.MeshPhysicalMaterial({
      name: 'Boron Steel (22MnB5)',
      color: 0x4a5560,
      metalness: 0.85, roughness: 0.2,
      clearcoat: 0.3, clearcoatRoughness: 0.1,
      envMapIntensity: 1.2,
    });
    const p: ChassisMaterialPreset = {
      name: 'Boron Steel (22MnB5)', category: 'steel', material: m,
      yieldStrengthMPa: 1300, tensileStrengthMPa: 1500,
      densityKgM3: 7850, elasticModulusGPa: 210,
      thermalConductivityWmK: 30, fatigueLifeCycles: 2000000,
    };
    this._cache.set('Boron Steel (22MnB5)', p);
    return p;
  }

  static maragingSteel300(): ChassisMaterialPreset {
    const c = this._cache.get('Maraging Steel 300'); if (c) return c;
    const m = new THREE.MeshPhysicalMaterial({
      name: 'Maraging Steel 300',
      color: 0x7a8490,
      metalness: 0.9, roughness: 0.16,
      clearcoat: 0.5, clearcoatRoughness: 0.06,
      envMapIntensity: 1.5,
    });
    const p: ChassisMaterialPreset = {
      name: 'Maraging Steel 300', category: 'steel', material: m,
      yieldStrengthMPa: 1800, tensileStrengthMPa: 1900,
      densityKgM3: 8000, elasticModulusGPa: 180,
      thermalConductivityWmK: 20, fatigueLifeCycles: 10000000,
    };
    this._cache.set('Maraging Steel 300', p);
    return p;
  }

  static aPX50CarbonComposite(): ChassisMaterialPreset {
    const c = this._cache.get('APX-50 Carbon Composite'); if (c) return c;
    const m = new THREE.MeshPhysicalMaterial({
      name: 'APX-50 Carbon Composite',
      color: 0x080c14,
      metalness: 0.3, roughness: 0.14,
      clearcoat: 0.98, clearcoatRoughness: 0.02,
      envMapIntensity: 1.4,
      sheen: 0.4, sheenColor: new THREE.Color(0x1a2030), sheenRoughness: 0.3,
    });
    const p: ChassisMaterialPreset = {
      name: 'APX-50 Carbon Composite', category: 'carbon', material: m,
      yieldStrengthMPa: 2500, tensileStrengthMPa: 4000,
      densityKgM3: 1600, elasticModulusGPa: 150,
      thermalConductivityWmK: 5, fatigueLifeCycles: 100000000,
    };
    this._cache.set('APX-50 Carbon Composite', p);
    return p;
  }

  static seamlessSteelTube4130(): ChassisMaterialPreset {
    const c = this._cache.get('Seamless Steel Tube (4130)'); if (c) return c;
    const m = new THREE.MeshPhysicalMaterial({
      name: 'Seamless Steel Tube (4130)',
      color: 0x707880,
      metalness: 0.92, roughness: 0.14,
      clearcoat: 0.6, clearcoatRoughness: 0.05,
      envMapIntensity: 1.6,
    });
    const p: ChassisMaterialPreset = {
      name: 'Seamless Steel Tube (4130)', category: 'steel', material: m,
      yieldStrengthMPa: 435, tensileStrengthMPa: 560,
      densityKgM3: 7850, elasticModulusGPa: 205,
      thermalConductivityWmK: 42, fatigueLifeCycles: 5000000,
    };
    this._cache.set('Seamless Steel Tube (4130)', p);
    return p;
  }

  static greyCastIronGG30(): ChassisMaterialPreset {
    const c = this._cache.get('Grey Cast Iron (GG-30)'); if (c) return c;
    const m = new THREE.MeshPhysicalMaterial({
      name: 'Grey Cast Iron (GG-30)',
      color: 0x505058,
      metalness: 0.75, roughness: 0.35,
      clearcoat: 0.1, clearcoatRoughness: 0.2,
      envMapIntensity: 0.8,
    });
    const p: ChassisMaterialPreset = {
      name: 'Grey Cast Iron (GG-30)', category: 'cast', material: m,
      yieldStrengthMPa: 200, tensileStrengthMPa: 300,
      densityKgM3: 7200, elasticModulusGPa: 100,
      thermalConductivityWmK: 52, fatigueLifeCycles: 1000000,
    };
    this._cache.set('Grey Cast Iron (GG-30)', p);
    return p;
  }

  static epoxyPrimerAntiCorrosion(): ChassisMaterialPreset {
    const c = this._cache.get('Epoxy Primer (Anti-Corrosion)'); if (c) return c;
    const m = new THREE.MeshPhysicalMaterial({
      name: 'Epoxy Primer (Anti-Corrosion)',
      color: 0x44484e,
      metalness: 0.05, roughness: 0.45,
      clearcoat: 0.2, clearcoatRoughness: 0.15,
      envMapIntensity: 0.6,
    });
    const p: ChassisMaterialPreset = {
      name: 'Epoxy Primer (Anti-Corrosion)', category: 'coating', material: m,
      yieldStrengthMPa: 0, tensileStrengthMPa: 0,
      densityKgM3: 1100, elasticModulusGPa: 3,
      thermalConductivityWmK: 0.2, fatigueLifeCycles: 0,
    };
    this._cache.set('Epoxy Primer (Anti-Corrosion)', p);
    return p;
  }

  static getAll(): ChassisMaterialPreset[] {
    return [
      this.aluminum6061T6(),
      this.chromolySteel4130(),
      this.aISI4340Steel(),
      this.titaniumGr5Ti6Al4V(),
      this.carbonFiberPrepregT700(),
      this.inconel718(),
      this.magnesiumAZ91D(),
      this.boronSteel22MnB5(),
      this.maragingSteel300(),
      this.aPX50CarbonComposite(),
      this.seamlessSteelTube4130(),
      this.greyCastIronGG30(),
      this.epoxyPrimerAntiCorrosion(),
    ];
  }

  static getByCategory(cat: ChassisMaterialPreset['category']): ChassisMaterialPreset[] {
    return this.getAll().filter(m => m.category === cat);
  }

  static getBestForApplication(app: 'monocoque' | 'roll_cage' | 'subframe' | 'crash_structure' | 'floor_pan' | 'heat_shield'): ChassisMaterialPreset {
    switch (app) {
      case 'monocoque': return this.aluminum6061T6();
      case 'roll_cage': return this.chromolySteel4130();
      case 'subframe': return this.aISI4340Steel();
      case 'crash_structure': return this.boronSteel22MnB5();
      case 'floor_pan': return this.aluminum6061T6();
      case 'heat_shield': return this.inconel718();
      default: return this.aluminum6061T6();
    }
  }
}
