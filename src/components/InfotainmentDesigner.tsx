import { useMemo } from "react";
import {
  Monitor, Cpu, Mic, Brain, Smartphone, ShieldAlert, Gauge,
  Wifi, Lightbulb, Sparkles, Users, Car, Bot, Activity, Zap, Thermometer,
  DollarSign, Wind, Sofa, KeyRound, ParkingSquare, Snowflake, Volume2, Crown,
  CircuitBoard, Eye, BatteryCharging, RefreshCw, Wrench,
} from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { Section } from "./ui/Controls";
import { RadialGauge } from "./ui/Charts";
import { simulate } from "../sim/engine";
import {
  INFO_OS_TIERS, INFO_VOICE_LEVELS,
} from "../sim/constants";
import {
  CLUSTER_LEVELS, INFOTAINMENT_SCREENS, SCREEN_TECH_OPTIONS, CONNECTIVITY_TIERS,
  CONNECTIVITY_EXTRAS, AUDIO_TIERS, CLIMATE_TIERS, CLIMATE_EXTRAS, SEAT_TIERS,
  SEAT_FEATURES, LIGHTING_TIERS, ADAS_LEVELS, PARKING_FEATURES, KEY_TYPES,
  HUD_TYPES, DASH_MATERIALS, ROOF_TYPES, CONVENIENCE_FEATURES, LUXURY_PACKAGE,
  AI_FEATURES, SAFETY_ELECTRONICS,
} from "../sim/electronicsData";
import type { InfotainmentConfig } from "../sim/types";

/* ---------- UI helpers ---------- */

function ChoiceCard<T extends string | number>({ value, options, onChange, columns = 3 }: {
  value: T; options: { value: T; label: string; sub?: string }[]; onChange: (v: T) => void; columns?: number;
}) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button key={String(o.value)} onClick={() => onChange(o.value)}
          className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-all border text-left ${
            value === o.value ? "bg-accent-500/20 border-accent-500/50 text-accent-300" : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"
          }`}>
          <div>{o.label}</div>
          {o.sub && <div className="text-[10px] text-slate-600 mt-0.5 normal-case font-normal">{o.sub}</div>}
        </button>
      ))}
    </div>
  );
}

function ToggleRow({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg border transition-all text-left ${
        value ? "bg-accent-500/10 border-accent-500/30" : "bg-base-850 border-base-800"
      }`}>
      <div className="min-w-0 pr-2">
        <div className={`text-xs font-medium ${value ? "text-accent-300" : "text-slate-300"}`}>{label}</div>
        {desc && <div className="text-[10px] text-slate-600 mt-0.5">{desc}</div>}
      </div>
      <span className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${value ? "bg-accent-500" : "bg-base-700"}`}>
        <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${value ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}

function StatRow({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 text-slate-500"><span className="text-slate-600">{icon}</span>{label}</span>
      <span className={"font-mono " + color}>{value}</span>
    </div>
  );
}

function moduleStatsRow(m: { cost: number; weight: number; power: number; luxury: number; tech: number }) {
  return (
    <div className="mt-2 grid grid-cols-4 gap-2 text-center">
      <div><div className="text-[9px] text-slate-600 uppercase">Cost</div><div className="font-mono text-[11px] text-accent-300">${m.cost}</div></div>
      <div><div className="text-[9px] text-slate-600 uppercase">Weight</div><div className="font-mono text-[11px] text-slate-300">{m.weight}kg</div></div>
      <div><div className="text-[9px] text-slate-600 uppercase">Power</div><div className="font-mono text-[11px] text-warn-400">{m.power}W</div></div>
      <div><div className="text-[9px] text-slate-600 uppercase">Luxury</div><div className="font-mono text-[11px] text-amber-300">{(m.luxury * 100).toFixed(0)}%</div></div>
    </div>
  );
}

/* ---------- Impact Panel ---------- */

function ImpactPanel({ sim }: { sim: ReturnType<typeof simulate> }) {
  const i = sim.infotainment;
  const costPct = Math.min(100, (i.totalCost / Math.max(sim.totalCost, 1)) * 100);
  const rows: { icon: React.ReactNode; label: string; value: string; color: string }[] = [
    { icon: <DollarSign size={12} />, label: "Hardware Cost", value: "$" + i.hardwareCost.toLocaleString(), color: "text-slate-200" },
    { icon: <DollarSign size={12} />, label: "Software Cost", value: "$" + i.softwareCost.toLocaleString(), color: "text-slate-200" },
    { icon: <DollarSign size={12} />, label: "Total Cost", value: "$" + i.totalCost.toLocaleString(), color: "text-accent-300" },
    { icon: <Activity size={12} />, label: "Share of Vehicle", value: costPct.toFixed(1) + "%", color: "text-slate-400" },
    { icon: <DollarSign size={12} />, label: "Retail Price Impact", value: "+$" + i.retailPriceImpact.toLocaleString(), color: "text-ok-400" },
    { icon: <Zap size={12} />, label: "Power Draw", value: i.powerDraw + " W", color: "text-warn-400" },
    { icon: <Car size={12} />, label: "Weight", value: i.weight + " kg", color: "text-slate-400" },
    { icon: <Thermometer size={12} />, label: "Heat Generation", value: (i.heatGeneration * 100).toFixed(0) + "%", color: "text-warn-400" },
    { icon: <Cpu size={12} />, label: "Wiring Complexity", value: (i.wiringComplexity * 100).toFixed(0) + "%", color: "text-slate-400" },
    { icon: <Wrench size={12} />, label: "Assembly Time", value: i.assemblyTime + " hr", color: "text-slate-400" },
    { icon: <BatteryCharging size={12} />, label: "Battery Needed", value: i.batterySizeRequired + " kWh", color: "text-warn-400" },
    { icon: <ShieldAlert size={12} />, label: "Cyber Risk", value: (i.cybersecurityRisk * 100).toFixed(0) + "%", color: i.cybersecurityRisk > 0.5 ? "text-danger-400" : i.cybersecurityRisk > 0.3 ? "text-warn-400" : "text-ok-400" },
    { icon: <Activity size={12} />, label: "Reliability", value: (i.reliability * 100).toFixed(0) + "%", color: i.reliability > 0.85 ? "text-ok-400" : i.reliability > 0.7 ? "text-warn-400" : "text-danger-400" },
    { icon: <Sparkles size={12} />, label: "Luxury Score", value: (i.luxuryScore * 100).toFixed(0) + "%", color: "text-amber-300" },
    { icon: <Cpu size={12} />, label: "Technology Score", value: (i.technologyScore * 100).toFixed(0) + "%", color: "text-accent-300" },
    { icon: <ShieldAlert size={12} />, label: "Safety Bonus", value: "+" + (i.safetyBonus * 100).toFixed(0) + "%", color: "text-ok-400" },
    { icon: <Users size={12} />, label: "Customer Appeal", value: (i.customerSatisfaction * 100).toFixed(0) + "%", color: "text-ok-400" },
    { icon: <Wrench size={12} />, label: "Maintenance/yr", value: "$" + i.maintenanceCost.toLocaleString(), color: "text-slate-400" },
    { icon: <ShieldAlert size={12} />, label: "Warranty Risk", value: (i.warrantyRisk * 100).toFixed(0) + "%", color: i.warrantyRisk > 0.4 ? "text-danger-400" : "text-warn-400" },
    { icon: <Gauge size={12} />, label: "Boot Time", value: i.bootTime + " s", color: "text-slate-400" },
    { icon: <Mic size={12} />, label: "Voice Accuracy", value: (i.voiceAccuracy * 100).toFixed(0) + "%", color: "text-slate-400" },
    { icon: <Bot size={12} />, label: "Active Features", value: String(i.featureCount), color: "text-accent-300" },
  ];
  return (
    <div className="panel p-4 sticky top-20">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={16} className="text-accent-400" />
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Live Impact</h3>
      </div>
      {/* Trim name */}
      <div className="mb-4 p-3 rounded-lg border border-accent-500/30 bg-accent-500/5">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Generated Trim</div>
        <div className="text-base font-bold text-accent-300">{i.trimName}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">{i.trimDescription}</div>
      </div>
      {/* Tech gauge */}
      <div className="flex flex-col items-center mb-4">
        <RadialGauge value={i.technologyScore * 10} max={10} label="Tech" size={120} />
        <div className="mt-2 grid grid-cols-3 gap-2 w-full text-center">
          <div><div className="text-[10px] text-slate-600 uppercase">Luxury</div><div className="font-mono text-sm text-amber-300">{(i.luxuryScore * 100).toFixed(0)}</div></div>
          <div><div className="text-[10px] text-slate-600 uppercase">Appeal</div><div className="font-mono text-sm text-ok-400">{(i.customerSatisfaction * 100).toFixed(0)}</div></div>
          <div><div className="text-[10px] text-slate-600 uppercase">Reliab.</div><div className="font-mono text-sm text-accent-300">{(i.reliability * 100).toFixed(0)}</div></div>
        </div>
      </div>
      <div className="space-y-1.5">{rows.map((r) => <StatRow key={r.label} {...r} />)}</div>
      <div className="mt-3 pt-3 border-t border-base-800 text-[10px] text-slate-600">Updates in real time as you configure modules.</div>
    </div>
  );
}

/* ---------- Main ---------- */

export function InfotainmentDesigner() {
  const { design, updateInfotainment } = useDesign();
  const info = design.infotainment;
  const sim = useMemo(() => simulate(design), [design]);
  const set = <K extends keyof InfotainmentConfig>(key: K, val: InfotainmentConfig[K]) => updateInfotainment({ [key]: val } as Partial<InfotainmentConfig>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
      <div className="space-y-4 min-w-0 stagger">
        {/* Header */}
        <div className="panel-glow p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent-500/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none animate-pulse" style={{ animationDuration: "4s" }} />
          <div className="relative flex items-center gap-2">
            <CircuitBoard size={18} className="text-accent-400" />
            <h2 className="text-sm font-semibold text-slate-200">Vehicle Electronics Studio</h2>
            <span className="text-xs text-slate-500">— Build your own trim, module by module</span>
          </div>
          <p className="relative text-xs text-slate-500 mt-1">Every electronic, comfort, and infotainment module can be selected individually. Each choice affects cost, weight, power, reliability, luxury, safety, and customer appeal. A unique trim name is generated automatically.</p>
        </div>

        {/* 1. Instrument Cluster */}
        <Section title="1. Instrument Cluster" icon={<Gauge size={16} />}>
          <ChoiceCard value={info.clusterLevel} columns={4}
            options={(Object.keys(CLUSTER_LEVELS) as unknown as string[]).map((k) => ({ value: Number(k) as 1|2|3|4|5|6|7, label: CLUSTER_LEVELS[Number(k) as 1|2|3|4|5|6|7].label, sub: CLUSTER_LEVELS[Number(k) as 1|2|3|4|5|6|7].sub }))}
            onChange={(v) => set("clusterLevel", v)} />
          {moduleStatsRow(CLUSTER_LEVELS[info.clusterLevel])}
        </Section>

        {/* 2. Infotainment Screen */}
        <Section title="2. Infotainment Screen" icon={<Monitor size={16} />}>
          <div className="label-mono mb-1.5">Screen Size</div>
          <ChoiceCard value={info.displayConfig} columns={4}
            options={INFOTAINMENT_SCREENS.map((s) => ({ value: s.value as InfotainmentConfig["displayConfig"], label: s.label }))}
            onChange={(v) => set("displayConfig", v)} />
          <div className="mt-3"><div className="label-mono mb-1.5">Display Technology</div>
            <ChoiceCard value={info.displayTech} columns={4}
              options={SCREEN_TECH_OPTIONS.map((t) => ({ value: t.value as InfotainmentConfig["displayTech"], label: t.label }))}
              onChange={(v) => set("displayTech", v)} />
          </div>
        </Section>

        {/* 3. Operating System */}
        <Section title="3. Operating System" icon={<Cpu size={16} />}>
          <ChoiceCard value={info.osTier} columns={3}
            options={(Object.keys(INFO_OS_TIERS) as InfotainmentConfig["osTier"][]).map((k) => ({ value: k, label: INFO_OS_TIERS[k].label, sub: INFO_OS_TIERS[k].description }))}
            onChange={(v) => set("osTier", v)} />
          {info.osTier !== "none" && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-1.5">
              <ToggleRow label="OTA Updates" value={info.otaUpdates} onChange={(v) => set("otaUpdates", v)} />
              <ToggleRow label="App Store" value={info.appStore} onChange={(v) => set("appStore", v)} />
              <ToggleRow label="Multi-User" value={info.multiUser} onChange={(v) => set("multiUser", v)} />
              <ToggleRow label="Cloud Backup" value={info.cloudBackup} onChange={(v) => set("cloudBackup", v)} />
              <ToggleRow label="Split-Screen" value={info.splitScreen} onChange={(v) => set("splitScreen", v)} />
              <ToggleRow label="AI Chatbot" value={info.aiChatbot} onChange={(v) => set("aiChatbot", v)} />
            </div>
          )}
          <div className="mt-3"><div className="label-mono mb-1.5">Voice Assistant</div>
            <ChoiceCard value={info.voiceLevel} columns={4}
              options={[0,1,2,3,4,5,6,7].map((lv) => { const v = INFO_VOICE_LEVELS[lv as InfotainmentConfig["voiceLevel"]]; return { value: lv as InfotainmentConfig["voiceLevel"], label: v.label, sub: v.description }; })}
              onChange={(v) => set("voiceLevel", v)} />
          </div>
        </Section>

        {/* 4. Connectivity */}
        <Section title="4. Connectivity" icon={<Wifi size={16} />}>
          <ChoiceCard value={info.connectivityTier} columns={3}
            options={(Object.keys(CONNECTIVITY_TIERS) as InfotainmentConfig["connectivityTier"][]).map((k) => ({ value: k, label: CONNECTIVITY_TIERS[k].label, sub: CONNECTIVITY_TIERS[k].sub }))}
            onChange={(v) => set("connectivityTier", v)} />
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-1.5">
            {CONNECTIVITY_EXTRAS.map((ex) => (
              <ToggleRow key={ex.key} label={ex.label} desc={ex.desc}
                value={(info.connExtras as Record<string, boolean>)[ex.key]}
                onChange={(v) => set("connExtras", { ...info.connExtras, [ex.key]: v })} />
            ))}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            <ToggleRow label="V2V" value={info.v2v} onChange={(v) => set("v2v", v)} />
            <ToggleRow label="V2I" value={info.v2i} onChange={(v) => set("v2i", v)} />
            <ToggleRow label="Cloud Sync" value={info.cloudSync} onChange={(v) => set("cloudSync", v)} />
          </div>
        </Section>

        {/* 5. Audio Systems */}
        <Section title="5. Audio Systems" icon={<Volume2 size={16} />}>
          <ChoiceCard value={info.audioTier} columns={3}
            options={(Object.keys(AUDIO_TIERS) as InfotainmentConfig["audioTier"][]).map((k) => ({ value: k, label: AUDIO_TIERS[k].label, sub: AUDIO_TIERS[k].sub }))}
            onChange={(v) => set("audioTier", v)} />
          {moduleStatsRow(AUDIO_TIERS[info.audioTier])}
        </Section>

        {/* 6. Climate Control */}
        <Section title="6. Climate Control" icon={<Snowflake size={16} />}>
          <ChoiceCard value={info.climateTier} columns={3}
            options={(Object.keys(CLIMATE_TIERS) as InfotainmentConfig["climateTier"][]).map((k) => ({ value: k, label: CLIMATE_TIERS[k].label, sub: CLIMATE_TIERS[k].sub }))}
            onChange={(v) => set("climateTier", v)} />
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-1.5">
            {CLIMATE_EXTRAS.map((ex) => (
              <ToggleRow key={ex.key} label={ex.label} desc={ex.desc}
                value={(info.climateExtras as Record<string, boolean>)[ex.key]}
                onChange={(v) => set("climateExtras", { ...info.climateExtras, [ex.key]: v })} />
            ))}
          </div>
        </Section>

        {/* 7. Seats */}
        <Section title="7. Seats" icon={<Sofa size={16} />}>
          <ChoiceCard value={info.seatTier} columns={3}
            options={(Object.keys(SEAT_TIERS) as InfotainmentConfig["seatTier"][]).map((k) => ({ value: k, label: SEAT_TIERS[k].label, sub: SEAT_TIERS[k].sub }))}
            onChange={(v) => set("seatTier", v)} />
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-1.5">
            {SEAT_FEATURES.map((sf) => (
              <ToggleRow key={sf.key} label={sf.label}
                value={(info.seatFeatures as Record<string, boolean>)[sf.key]}
                onChange={(v) => set("seatFeatures", { ...info.seatFeatures, [sf.key]: v })} />
            ))}
          </div>
        </Section>

        {/* 8. Interior Lighting */}
        <Section title="8. Interior Lighting" icon={<Lightbulb size={16} />}>
          <ChoiceCard value={info.lightingTier} columns={4}
            options={(Object.keys(LIGHTING_TIERS) as InfotainmentConfig["lightingTier"][]).map((k) => ({ value: k, label: LIGHTING_TIERS[k].label, sub: LIGHTING_TIERS[k].sub }))}
            onChange={(v) => set("lightingTier", v)} />
          <div className="mt-3">
            <div className="flex justify-between items-baseline mb-1"><label className="label-mono">Ambient Colors</label><span className="font-mono text-xs text-amber-300">{info.ambientLightColors}</span></div>
            <input type="range" min={1} max={256} value={info.ambientLightColors} onChange={(e) => set("ambientLightColors", parseInt(e.target.value))} className="w-full" />
            <div className="flex h-2 rounded-full mt-1 overflow-hidden" style={{ background: "linear-gradient(to right, #1e2839, #06b6d4, #22d3ee, #fbbf24, #ef4444, #a855f7)" }} />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            <ToggleRow label="Dynamic" value={info.dynamicLighting} onChange={(v) => set("dynamicLighting", v)} />
            <ToggleRow label="Music-Synced" value={info.musicSyncLighting} onChange={(v) => set("musicSyncLighting", v)} />
            <ToggleRow label="Welcome Show" value={info.welcomeShow} onChange={(v) => set("welcomeShow", v)} />
            <ToggleRow label="Goodbye" value={info.goodbyeAnimation} onChange={(v) => set("goodbyeAnimation", v)} />
            <ToggleRow label="Personalized Startup" value={info.personalizedStartup} onChange={(v) => set("personalizedStartup", v)} />
          </div>
        </Section>

        {/* 9. Driver Assistance */}
        <Section title="9. Driver Assistance (ADAS)" icon={<Car size={16} />}>
          <ChoiceCard value={info.adasLevel} columns={3}
            options={[0,1,2,3,4,5].map((lv) => ({ value: lv as InfotainmentConfig["adasLevel"], label: ADAS_LEVELS[lv as InfotainmentConfig["adasLevel"]].label, sub: ADAS_LEVELS[lv as InfotainmentConfig["adasLevel"]].sub }))}
            onChange={(v) => set("adasLevel", v)} />
          {moduleStatsRow(ADAS_LEVELS[info.adasLevel])}
        </Section>

        {/* 10. Parking Systems */}
        <Section title="10. Parking Systems" icon={<ParkingSquare size={16} />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
            {PARKING_FEATURES.map((pf) => (
              <ToggleRow key={pf.key} label={pf.label} desc={pf.desc}
                value={(info.parking as Record<string, boolean>)[pf.key]}
                onChange={(v) => set("parking", { ...info.parking, [pf.key]: v })} />
            ))}
          </div>
        </Section>

        {/* 11. Keys */}
        <Section title="11. Keys" icon={<KeyRound size={16} />}>
          <ChoiceCard value={info.keyType} columns={3}
            options={(Object.keys(KEY_TYPES) as InfotainmentConfig["keyType"][]).map((k) => ({ value: k, label: KEY_TYPES[k].label, sub: KEY_TYPES[k].sub }))}
            onChange={(v) => set("keyType", v)} />
        </Section>

        {/* 12. HUD */}
        <Section title="12. Head-Up Display" icon={<Eye size={16} />}>
          <ChoiceCard value={info.hudType} columns={4}
            options={(Object.keys(HUD_TYPES) as InfotainmentConfig["hudType"][]).map((k) => ({ value: k, label: HUD_TYPES[k].label, sub: HUD_TYPES[k].sub }))}
            onChange={(v) => set("hudType", v)} />
        </Section>

        {/* 13. Interior Materials */}
        <Section title="13. Interior Materials (Dashboard)" icon={<Sparkles size={16} />}>
          <ChoiceCard value={info.dashMaterial} columns={5}
            options={(Object.keys(DASH_MATERIALS) as InfotainmentConfig["dashMaterial"][]).map((k) => ({ value: k, label: DASH_MATERIALS[k].label, sub: DASH_MATERIALS[k].sub }))}
            onChange={(v) => set("dashMaterial", v)} />
          {moduleStatsRow(DASH_MATERIALS[info.dashMaterial])}
        </Section>

        {/* 14. Roof */}
        <Section title="14. Roof" icon={<Wind size={16} />}>
          <ChoiceCard value={info.roofType} columns={3}
            options={(Object.keys(ROOF_TYPES) as InfotainmentConfig["roofType"][]).map((k) => ({ value: k, label: ROOF_TYPES[k].label, sub: ROOF_TYPES[k].sub }))}
            onChange={(v) => set("roofType", v)} />
          {moduleStatsRow(ROOF_TYPES[info.roofType])}
        </Section>

        {/* 15. Convenience Features */}
        <Section title="15. Convenience Features" icon={<RefreshCw size={16} />}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
            {CONVENIENCE_FEATURES.map((cf) => (
              <ToggleRow key={cf.key} label={cf.label} desc={cf.desc}
                value={(info.convenience as Record<string, boolean>)[cf.key]}
                onChange={(v) => set("convenience", { ...info.convenience, [cf.key]: v })} />
            ))}
          </div>
        </Section>

        {/* 16. Luxury Package */}
        <Section title="16. Luxury Package" icon={<Crown size={16} />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
            {LUXURY_PACKAGE.map((lp) => (
              <ToggleRow key={lp.key} label={lp.label} desc={lp.desc}
                value={(info.luxuryPackage as Record<string, boolean>)[lp.key]}
                onChange={(v) => set("luxuryPackage", { ...info.luxuryPackage, [lp.key]: v })} />
            ))}
          </div>
        </Section>

        {/* 17. AI Features */}
        <Section title="17. AI Features" icon={<Brain size={16} />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
            {AI_FEATURES.map((af) => (
              <ToggleRow key={af.key} label={af.label} desc={af.desc}
                value={(info.aiFeatures as Record<string, boolean>)[af.key]}
                onChange={(v) => set("aiFeatures", { ...info.aiFeatures, [af.key]: v })} />
            ))}
          </div>
        </Section>

        {/* 18. Safety Electronics */}
        <Section title="18. Safety Electronics" icon={<ShieldAlert size={16} />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
            {SAFETY_ELECTRONICS.map((se) => (
              <ToggleRow key={se.key} label={se.label} desc={se.desc}
                value={(info.safetyElectronics as Record<string, boolean>)[se.key]}
                onChange={(v) => set("safetyElectronics", { ...info.safetyElectronics, [se.key]: v })} />
            ))}
          </div>
        </Section>

        {/* 19. Vehicle Control App */}
        <Section title="19. Vehicle Control App" icon={<Smartphone size={16} />}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
            {(["lockUnlock","startEngine","climateControl","locateVehicle","openTrunk","windowControl","chargeScheduling","otaUpdates","digitalKeySharing"] as const).map((k) => (
              <ToggleRow key={k} label={k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}
                value={info.remoteApp[k]} onChange={(v) => set("remoteApp", { ...info.remoteApp, [k]: v })} />
            ))}
          </div>
        </Section>

        {/* 20. Trim Summary */}
        <Section title="20. Generated Trim Summary" icon={<Crown size={16} />}>
          <div className="p-4 rounded-lg border border-accent-500/30 bg-accent-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Crown size={18} className="text-amber-400" />
              <span className="text-lg font-bold text-accent-300">{sim.infotainment.trimName}</span>
            </div>
            <p className="text-sm text-slate-400">{sim.infotainment.trimDescription}</p>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
              <div className="bg-base-850 border border-base-800 rounded-lg px-2 py-1.5"><div className="label-mono">Total Cost</div><div className="font-mono text-sm text-accent-300">${sim.infotainment.totalCost.toLocaleString()}</div></div>
              <div className="bg-base-850 border border-base-800 rounded-lg px-2 py-1.5"><div className="label-mono">Retail +</div><div className="font-mono text-sm text-ok-400">${sim.infotainment.retailPriceImpact.toLocaleString()}</div></div>
              <div className="bg-base-850 border border-base-800 rounded-lg px-2 py-1.5"><div className="label-mono">Features</div><div className="font-mono text-sm text-slate-200">{sim.infotainment.featureCount}</div></div>
              <div className="bg-base-850 border border-base-800 rounded-lg px-2 py-1.5"><div className="label-mono">Appeal</div><div className="font-mono text-sm text-ok-400">{(sim.infotainment.customerSatisfaction * 100).toFixed(0)}%</div></div>
            </div>
          </div>
        </Section>
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block"><ImpactPanel sim={sim} /></div>
    </div>
  );
}
