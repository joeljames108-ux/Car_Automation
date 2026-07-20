import { useDesign, fmtCurrency } from "../state/DesignContext";
import { Section, Select, Slider, StatTile } from "./ui/Controls";
import {
  FRAME_MATERIALS, MANUFACTURING_PROCESSES, FACTORY_TIERS, AUTOMATION_LEVELS,
  QC_LEVELS, ASSEMBLY_LINES,
} from "../sim/constants";
import type {
  FrameMaterial, ManufacturingProcess, FactoryTier, AutomationLevel, QcLevel,
  ManufacturingConfig,
} from "../sim/types";
import { Factory, Wrench, ShieldCheck, Boxes, Gauge, DollarSign, TrendingUp, Cpu, Clock } from "lucide-react";

export function ManufacturingDesigner() {
  const { design, sim, updateManufacturing } = useDesign();
  const m = design.manufacturing;
  const mfg = sim.manufacturing;

  const frameOptions = Object.entries(FRAME_MATERIALS).map(([k, v]) => ({ value: k as FrameMaterial, label: v.label }));
  const processOptions = Object.entries(MANUFACTURING_PROCESSES).map(([k, v]) => ({ value: k as ManufacturingProcess, label: v.label }));
  const factoryOptions = Object.entries(FACTORY_TIERS).map(([k, v]) => ({ value: k as FactoryTier, label: v.label }));
  const automationOptions = Object.entries(AUTOMATION_LEVELS).map(([k, v]) => ({ value: k as AutomationLevel, label: v.label }));
  const qcOptions = Object.entries(QC_LEVELS).map(([k, v]) => ({ value: k as QcLevel, label: v.label }));
  const assemblyOptions = Object.entries(ASSEMBLY_LINES).map(([k, v]) => ({ value: k, label: v.label }));

  const cb = sim.costBreakdown;
  const totalCB = cb.materials + cb.labor + cb.tooling + cb.assembly + cb.warranty + cb.overhead;

  return (
    <div className="space-y-4 stagger">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Manufacturing & Production</h2>
        <p className="text-sm text-slate-500">Configure the production pipeline, factory, and quality systems. Cost and time update live.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Materials */}
        <Section title="Frame & Body Materials" icon={<Boxes size={14} />}>
          <Select label="Frame Material" value={m.frameMaterial} options={frameOptions} onChange={(v) => updateManufacturing({ frameMaterial: v })} />
          <Select label="Body Material" value={m.bodyMaterial} options={frameOptions} onChange={(v) => updateManufacturing({ bodyMaterial: v })} />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <StatTile label="Frame Wt Factor" value={FRAME_MATERIALS[m.frameMaterial].weightFactor.toFixed(2)} accent="default" />
            <StatTile label="Frame Strength" value={FRAME_MATERIALS[m.frameMaterial].strengthFactor.toFixed(2)} accent="ok" />
            <StatTile label="Frame $/kg" value={`$${FRAME_MATERIALS[m.frameMaterial].costPerKg}`} accent="warn" />
            <StatTile label="Corrosion Resist" value={`${Math.round(FRAME_MATERIALS[m.frameMaterial].corrosionResist * 100)}%`} accent="default" />
          </div>
        </Section>

        {/* Process */}
        <Section title="Manufacturing Process" icon={<Wrench size={14} />}>
          <Select label="Process" value={m.process} options={processOptions} onChange={(v) => updateManufacturing({ process: v })} />
          <p className="text-xs text-slate-500 mt-2">{MANUFACTURING_PROCESSES[m.process].description}</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <StatTile label="Labor Hours" value={MANUFACTURING_PROCESSES[m.process].laborHours} unit="h" accent="default" />
            <StatTile label="Base Defect Rate" value={MANUFACTURING_PROCESSES[m.process].defectRate} unit="/1k" accent="warn" />
            <StatTile label="Cost Factor" value={`${MANUFACTURING_PROCESSES[m.process].costFactor}x`} accent="default" />
            <StatTile label="Automation" value={`${Math.round(MANUFACTURING_PROCESSES[m.process].automationFactor * 100)}%`} accent="accent" />
          </div>
        </Section>

        {/* Factory */}
        <Section title="Factory Tier" icon={<Factory size={14} />}>
          <Select label="Factory" value={m.factoryTier} options={factoryOptions} onChange={(v) => updateManufacturing({ factoryTier: v })} />
          <p className="text-xs text-slate-500 mt-2">{FACTORY_TIERS[m.factoryTier].description}</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <StatTile label="Capacity" value={FACTORY_TIERS[m.factoryTier].capacity.toLocaleString()} unit="/yr" accent="default" />
            <StatTile label="Setup Cost" value={fmtCurrency(FACTORY_TIERS[m.factoryTier].setupCost)} accent="warn" />
            <StatTile label="Overhead Rate" value={`${FACTORY_TIERS[m.factoryTier].overheadRate}x`} accent="default" />
            <StatTile label="Volume Util" value={`${Math.round((m.productionVolume / FACTORY_TIERS[m.factoryTier].capacity) * 100)}%`} accent={m.productionVolume > FACTORY_TIERS[m.factoryTier].capacity ? "danger" : "ok"} />
          </div>
        </Section>

        {/* Automation */}
        <Section title="Automation & Assembly" icon={<Cpu size={14} />}>
          <Select label="Automation Level" value={m.automation} options={automationOptions} onChange={(v) => updateManufacturing({ automation: v })} />
          <div className="mt-3">
            <label className="label-mono mb-1.5 block">Assembly Line</label>
            <div className="grid grid-cols-2 gap-1.5">
              {assemblyOptions.map((o) => (
                <button
                  key={o.value}
                  onClick={() => updateManufacturing({ assemblyLine: o.value as ManufacturingConfig["assemblyLine"] })}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    m.assemblyLine === o.value
                      ? "bg-accent-500/20 border-accent-500/50 text-accent-300"
                      : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <StatTile label="Robots" value={AUTOMATION_LEVELS[m.automation].robotCount} accent="accent" />
            <StatTile label="Efficiency" value={`${Math.round(AUTOMATION_LEVELS[m.automation].efficiency * 100)}%`} accent="ok" />
            <StatTile label="Error Reduction" value={`${Math.round(AUTOMATION_LEVELS[m.automation].errorReduction * 100)}%`} accent="ok" />
            <StatTile label="Capex/Station" value={fmtCurrency(AUTOMATION_LEVELS[m.automation].capexPerStation)} accent="warn" />
          </div>
        </Section>

        {/* Quality Control */}
        <Section title="Quality Control" icon={<ShieldCheck size={14} />}>
          <Select label="QC Level" value={m.qcLevel} options={qcOptions} onChange={(v) => updateManufacturing({ qcLevel: v })} />
          <p className="text-xs text-slate-500 mt-2">{QC_LEVELS[m.qcLevel].description}</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <StatTile label="Inspection Time" value={QC_LEVELS[m.qcLevel].inspectionTime} unit="h" accent="default" />
            <StatTile label="Defect Catch" value={`${Math.round(QC_LEVELS[m.qcLevel].defectCatchRate * 100)}%`} accent="ok" />
            <StatTile label="QC Cost Factor" value={`${QC_LEVELS[m.qcLevel].costFactor}x`} accent="warn" />
            <StatTile label="Quality Score" value={mfg.qualityScore} unit="/100" accent={mfg.qualityScore > 80 ? "ok" : mfg.qualityScore > 60 ? "warn" : "danger"} />
          </div>
        </Section>

        {/* Production Volume */}
        <Section title="Production Volume" icon={<Gauge size={14} />}>
          <Slider label="Annual Volume" value={m.productionVolume} min={10} max={100000} step={10} onChange={(v) => updateManufacturing({ productionVolume: v })} format={(v) => v.toLocaleString()} unit=" units" />
          <Slider label="Shifts per Day" value={m.shiftCount} min={1} max={3} step={1} onChange={(v) => updateManufacturing({ shiftCount: v })} />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <StatTile label="Time per Unit" value={mfg.productionTime} unit="h" accent="default" />
            <StatTile label="Annual Hours" value={mfg.productionTimePerYear.toLocaleString()} unit="h" accent="default" />
            <StatTile label="Defect Rate" value={mfg.defectRate} unit="/1k" accent={mfg.defectRate < 1 ? "ok" : "warn"} />
            <StatTile label="Automation Score" value={mfg.automationScore} unit="/100" accent="accent" />
          </div>
        </Section>
      </div>

      {/* Cost Breakdown */}
      <Section title="Cost Breakdown (Phase 8)" icon={<DollarSign size={14} />} className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <CostBar label="Materials" value={cb.materials} total={totalCB} color="bg-accent-500" />
            <CostBar label="Labor" value={cb.labor} total={totalCB} color="bg-ok-500" />
            <CostBar label="Tooling" value={cb.tooling} total={totalCB} color="bg-warn-500" />
            <CostBar label="Assembly" value={cb.assembly} total={totalCB} color="bg-accent-400" />
            <CostBar label="Warranty" value={cb.warranty} total={totalCB} color="bg-danger-500" />
            <CostBar label="Overhead" value={cb.overhead} total={totalCB} color="bg-slate-500" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Material Cost" value={fmtCurrency(cb.materials)} accent="default" />
            <StatTile label="Labor Cost" value={fmtCurrency(cb.labor)} accent="default" />
            <StatTile label="Tooling Cost" value={fmtCurrency(cb.tooling)} accent="default" />
            <StatTile label="Assembly Cost" value={fmtCurrency(cb.assembly)} accent="default" />
            <StatTile label="Warranty Cost" value={fmtCurrency(cb.warranty)} accent="warn" />
            <StatTile label="Overhead Cost" value={fmtCurrency(cb.overhead)} accent="default" />
            <StatTile label="Unit Cost" value={fmtCurrency(mfg.unitCost)} accent="warn" />
            <StatTile label="Total Mfg Cost" value={fmtCurrency(totalCB)} accent="danger" />
          </div>
        </div>
      </Section>

      {/* Profit Summary */}
      <Section title="Pricing & Profit" icon={<TrendingUp size={14} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <StatTile label="Vehicle Cost" value={fmtCurrency(sim.vehicleCost)} accent="default" />
          <StatTile label="Engine Cost" value={fmtCurrency(sim.engineCost)} accent="default" />
          <StatTile label="Total Cost" value={fmtCurrency(sim.totalCost)} accent="warn" />
          <StatTile label="Target Price" value={fmtCurrency(sim.targetPrice)} accent="accent" />
          <StatTile label="Profit Margin" value={`${(sim.profitMargin * 100).toFixed(1)}%`} accent={sim.profitMargin > 0.2 ? "ok" : "warn"} />
          <StatTile label="Profit / Unit" value={fmtCurrency(sim.targetPrice - sim.totalCost)} accent="ok" />
          <StatTile label="Annual Profit" value={fmtCurrency((sim.targetPrice - sim.totalCost) * m.productionVolume)} accent="ok" sub={`at ${m.productionVolume.toLocaleString()} units/yr`} />
          <StatTile label="Safety Rating" value={`${sim.safetyRating}/5`} accent="ok" />
        </div>
      </Section>

      <div className="flex items-center gap-2 text-xs text-slate-600">
        <Clock size={12} />
        <span>Production time: {mfg.productionTime}h per unit · {mfg.productionTimePerYear.toLocaleString()}h annually</span>
      </div>
    </div>
  );
}

function CostBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pctV = Math.round((value / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="label-mono">{label}</span>
        <span className="font-mono text-slate-300">{fmtCurrency(value)} <span className="text-slate-600">({pctV}%)</span></span>
      </div>
      <div className="h-2 bg-base-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pctV}%` }} />
      </div>
    </div>
  );
}
