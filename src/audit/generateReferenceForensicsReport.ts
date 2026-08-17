// ============================================================================
// PHASE 02 — REFERENCE ASSET FORENSICS — REPORT GENERATOR
// ============================================================================
// Generates REFERENCE_ASSET_REPORT.md, REFERENCE_ASSET_REPORT.json, and
// REFERENCE_QUALITY_PROFILE.json from reference asset forensic analysis.
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';
import { ReferenceAssetForensicsEngine } from './referenceAssetForensicsEngine';
import { AutomotiveReferenceQualityProfile } from './referenceQualityProfile';

export class ReferenceForensicsReportGenerator {
  /**
   * Generates formatted Markdown representation of the Reference Asset Forensic Report.
   */
  public static generateMarkdown(profile: AutomotiveReferenceQualityProfile): string {
    const lines: string[] = [];

    lines.push('# 🏎️ Master Reference Asset Forensics & Quality Benchmark Report');
    lines.push(`**Generated:** ${profile.generatedTimestamp}  `);
    lines.push(`**Profile Version:** \`${profile.profileVersion}\`  `);
    lines.push(`**Audited Benchmark Packages:** \`${profile.auditedPackages.length}\` vehicles\n`);
    lines.push('---');

    // 1. Executive Summary
    lines.push('## 1. Executive Summary & Benchmark Purpose');
    lines.push('This forensic analysis audits the 3 reference automotive packages provided to establish the **visual quality, geometric fidelity, and PBR texture standards** for the Modular glTF Vehicle Construction System:');
    lines.push('1. **2015 Rocket Bunny Nissan Silvia S15** — Multi-channel normal map, mechanical detail & component separation benchmark.');
    lines.push('2. **2024 BYD Atto 3** — Production EV architecture, crystal LED alpha optics, baked AO contact shadow benchmark.');
    lines.push('3. **Volvo P1800 Restomod Widebody** — High-poly silhouette curve continuity, wall thickness & structural packaging benchmark.\n');

    // 2. Reference Package Audit Breakdown
    lines.push('## 2. Reference Package Forensic Analysis');

    for (const pkg of profile.auditedPackages) {
      lines.push(`### 📦 ${pkg.displayName}`);
      lines.push(`- **Format:** \`${pkg.sourceFormat}\` | **Package Size:** \`${(pkg.packageSizeBytes / (1024 * 1024)).toFixed(1)} MB\` | **Total Textures:** \`${pkg.totalTextureCount}\``);
      lines.push(`- **Geometric Plausibility Score:** \`${pkg.geometricPlausibilityScore} / 100\` | **PBR Completeness Score:** \`${pkg.pbrTextureCompletenessScore} / 100\`\n`);

      lines.push('#### Key Architectural Takeaways:');
      for (const t of pkg.keyArchitecturalTakeaways) {
        lines.push(`- 💡 ${t}`);
      }
      lines.push('\n');

      if (pkg.textures.length > 0) {
        lines.push('#### Texture Map Asset Sample:');
        lines.push('| Texture File | Channel Type | Target Component | Size | Color Space |');
        lines.push('|---|---|---|---|---|');
        for (const tex of pkg.textures.slice(0, 8)) {
          lines.push(
            `| \`${tex.fileName}\` | \`${tex.channelType}\` | \`${tex.componentTarget}\` | ${(tex.fileSizeBytes / 1024).toFixed(1)} KB | \`${tex.colorSpace}\` |`
          );
        }
        lines.push('\n');
      }
    }

    // 3. Derived Master Standards
    lines.push('## 3. Homologated Production Quality Standards');
    lines.push('### 🌟 Hero Detail Standard (Body, Wheels, Cockpit, Lighting)');
    lines.push(`- **Minimum Texture Resolution:** \`${profile.heroDetailStandard.minimumTextureResolution}x${profile.heroDetailStandard.minimumTextureResolution}\``);
    lines.push(`- **Mandatory Texture Channels:** \`${profile.heroDetailStandard.mandatoryChannels.join(', ')}\``);
    lines.push(`- **Max Panel Gap Tolerance:** \`${profile.heroDetailStandard.maxPanelGapToleranceMm} mm\``);
    lines.push(`- **Required Component Separation:** \`${profile.heroDetailStandard.requiredSeparateComponents.join(', ')}\`\n`);

    lines.push('### ⚙️ Functional Detail Standard (Chassis, Subframes, Engine Bay, Exhaust)');
    lines.push(`- **Minimum Texture Resolution:** \`${profile.functionalDetailStandard.minimumTextureResolution}x${profile.functionalDetailStandard.minimumTextureResolution}\``);
    lines.push(`- **Mandatory Texture Channels:** \`${profile.functionalDetailStandard.mandatoryChannels.join(', ')}\``);
    lines.push(`- **Required Component Separation:** \`${profile.functionalDetailStandard.requiredSeparateComponents.join(', ')}\`\n`);

    lines.push('### 🎨 PBR Shader & Optical Material Standards');
    lines.push(`- **Automotive Paint Layers:** \`${profile.pbrShaderStandards.paintLayers.join(' → ')}\``);
    lines.push(`- **Optical Glass Minimum Transmission:** \`${profile.pbrShaderStandards.glassTransmissionMin * 100}%\``);
    lines.push(`- **Tire Tread Minimum Roughness:** \`${profile.pbrShaderStandards.tireRoughnessMin}\``);
    lines.push(`- **Brake Rotor Machining Normal Map:** ${profile.pbrShaderStandards.brakeRotorMachiningNormalRequired ? '✅ **MANDATORY**' : 'Optional'}\n`);

    return lines.join('\n');
  }

  /**
   * Runs the audit and writes REFERENCE_ASSET_REPORT and REFERENCE_QUALITY_PROFILE to docs/.
   */
  public static executeAndWriteReports(rootDir: string): AutomotiveReferenceQualityProfile {
    const profile = ReferenceAssetForensicsEngine.auditAllReferences(rootDir);
    const docsDir = path.join(rootDir, 'docs');

    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // 1. Write REFERENCE_ASSET_REPORT.json
    fs.writeFileSync(
      path.join(docsDir, 'REFERENCE_ASSET_REPORT.json'),
      JSON.stringify(profile.auditedPackages, null, 2),
      'utf-8'
    );

    // 2. Write REFERENCE_QUALITY_PROFILE.json
    fs.writeFileSync(
      path.join(docsDir, 'REFERENCE_QUALITY_PROFILE.json'),
      JSON.stringify(profile, null, 2),
      'utf-8'
    );

    // 3. Write REFERENCE_ASSET_REPORT.md
    const md = this.generateMarkdown(profile);
    fs.writeFileSync(path.join(docsDir, 'REFERENCE_ASSET_REPORT.md'), md, 'utf-8');

    return profile;
  }
}
