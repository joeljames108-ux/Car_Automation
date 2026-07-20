import { useMemo, useState } from "react";
import {
  Newspaper, Trophy, Star, Users, Clock, Video, GitCompare, Award,
  Shield, TrendingUp, ThumbsUp, ThumbsDown, Flame, Sparkles,
} from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { Section, StatTile } from "./ui/Controls";
import { RadarChart, HorseshoeGauge, BarCompare, Podium, RadialGauge } from "./ui/Charts";
import { generateFullReview } from "../sim/reviews";
import type { CategoryScore, MagazineReview, FullReview } from "../sim/reviews";

type Tab = "overview" | "magazines" | "customers" | "longterm" | "influencers" | "comparison" | "awards" | "reliability";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <Newspaper size={14} /> },
  { id: "magazines", label: "Magazines", icon: <Newspaper size={14} /> },
  { id: "customers", label: "Customers", icon: <Users size={14} /> },
  { id: "longterm", label: "Long-Term", icon: <Clock size={14} /> },
  { id: "influencers", label: "Influencers", icon: <Video size={14} /> },
  { id: "comparison", label: "Comparison", icon: <GitCompare size={14} /> },
  { id: "awards", label: "Awards", icon: <Trophy size={14} /> },
  { id: "reliability", label: "Reliability", icon: <Shield size={14} /> },
];

const CAT_ICON: Record<string, React.ReactNode> = {
  performance: <Flame size={13} />,
  luxury: <Sparkles size={13} />,
  economy: <TrendingUp size={13} />,
  technology: <Video size={13} />,
};

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color = score >= 8.5 ? "bg-ok-500" : score >= 7 ? "bg-accent-500" : score >= 5.5 ? "bg-warn-500" : "bg-danger-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-base-800 rounded-full overflow-hidden">
        <div className={color + " h-full transition-all"} style={{ width: pct + "%" }} />
      </div>
      <span className="font-mono text-xs text-slate-300 w-8 text-right">{score.toFixed(1)}</span>
    </div>
  );
}

function ScoreGrid({ scores, title }: { scores: CategoryScore[]; title: string }) {
  return (
    <div>
      <div className="label-mono text-slate-500 mb-2">{title}</div>
      <div className="space-y-1.5">
        {scores.map((s) => (
          <div key={s.key} className="flex items-center gap-3">
            <span className="text-xs text-slate-400 w-28 shrink-0">{s.label}</span>
            <div className="flex-1"><ScoreBar score={s.score} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MagCard({ review }: { review: MagazineReview }) {
  const catColor =
    review.category === "performance" ? "text-orange-300 bg-orange-500/10 border-orange-500/30"
    : review.category === "luxury" ? "text-amber-300 bg-amber-500/10 border-amber-500/30"
    : review.category === "economy" ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
    : "text-sky-300 bg-sky-500/10 border-sky-500/30";
  return (
    <div className="panel p-4 space-y-3 transition-all duration-300 hover:border-base-700 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={"text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 " + catColor}>
              {CAT_ICON[review.category]}{review.category}
            </span>
            <h4 className="text-sm font-semibold text-slate-200">{review.magName}</h4>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-mono font-bold text-accent-300">{review.score.toFixed(1)}</div>
          <div className="text-[10px] text-slate-500">/ 10</div>
        </div>
      </div>
      <p className="text-xs italic text-slate-400 border-l-2 border-base-700 pl-3">{review.verdict}</p>
      <p className="text-xs text-slate-400 leading-relaxed">{review.article}</p>
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <div className="text-[10px] text-ok-400 mb-1 flex items-center gap-1"><ThumbsUp size={10} /> Pros</div>
          <ul className="space-y-0.5">
            {review.pros.map((p, i) => <li key={i} className="text-[11px] text-slate-400 flex gap-1"><span className="text-ok-500">+</span>{p}</li>)}
          </ul>
        </div>
        <div>
          <div className="text-[10px] text-danger-400 mb-1 flex items-center gap-1"><ThumbsDown size={10} /> Cons</div>
          <ul className="space-y-0.5">
            {review.cons.map((c, i) => <li key={i} className="text-[11px] text-slate-400 flex gap-1"><span className="text-danger-500">−</span>{c}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StarRow({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={12} className={i <= n ? "text-amber-400 fill-amber-400" : "text-base-700"} />
      ))}
    </span>
  );
}

function gradeToScore(g: string): number {
  const map: Record<string, number> = { "A+": 9.7, A: 9, B: 8, C: 7, D: 6, F: 4 };
  return map[g] ?? 7;
}

export function PressReviews() {
  const { design, sim } = useDesign();
  const [tab, setTab] = useState<Tab>("overview");
  const [seed, setSeed] = useState(0);

  const review: FullReview = useMemo(
    () => generateFullReview(design, sim),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [design, sim, seed]
  );

  const s = review.summary;
  const wonAwards = review.awards.filter((a) => a.won);
  const carName = design.name || "Your Car";
  const radarAxes = [
    { label: "Perf", value: s.performance },
    { label: "Comfort", value: s.comfort },
    { label: "Interior", value: s.interior },
    { label: "Tech", value: s.technology },
    { label: "Safety", value: s.safety },
    { label: "Own", value: s.ownership },
    { label: "Value", value: s.value },
  ];
  const avgStars = review.customerReviews.length
    ? review.customerReviews.reduce((a, c) => a + c.stars, 0) / review.customerReviews.length
    : 0;
  const compTotals = [
    review.comparison.rows.reduce((a, r) => a + r.yours, 0),
    ...review.comparison.competitors.map((_, i) => review.comparison.rows.reduce((a, r) => a + r.competitors[i], 0)),
  ];

  const demandColor = (d: string) =>
    d === "Very High" ? "text-ok-300 bg-ok-500/15 border-ok-500/40"
    : d === "High" ? "text-accent-300 bg-accent-500/15 border-accent-500/40"
    : d === "Moderate" ? "text-warn-300 bg-warn-500/15 border-warn-500/40"
    : "text-slate-400 bg-base-800 border-base-700";

  return (
    <div className="space-y-4 stagger">
      {/* Hero summary card */}
      <div className="panel-glow p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Newspaper size={18} className="text-accent-400" />
            <h2 className="text-sm font-semibold text-slate-200">Press & Industry Reviews</h2>
            <span className="text-xs text-slate-500">— {design.name || "Unnamed Prototype"}</span>
            <button
              onClick={() => setSeed((x) => x + 1)}
              className="ml-auto text-[10px] px-2 py-1 rounded-lg bg-base-800 border border-base-700 text-slate-400 hover:text-slate-200 transition-all"
            >
              Re-roll reviews
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-3 flex flex-col items-center justify-center bg-base-850 rounded-xl p-4 border border-base-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-accent-500/5 to-transparent pointer-events-none" />
              <div className="relative flex flex-col items-center">
                <HorseshoeGauge value={s.overall} size={170} />
                {s.editorsChoice && (
                  <div className="flex items-center gap-1 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full mt-1">
                    <Award size={11} /> Editor's Choice
                  </div>
                )}
                <div className={"mt-2 text-[11px] px-2.5 py-1 rounded-full border " + demandColor(review.marketDemand)}>
                  <TrendingUp size={10} className="inline mr-1" />Market Demand: {review.marketDemand}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center justify-center bg-base-850 rounded-xl p-4 border border-base-800">
              <div className="label-mono mb-1">Category Profile</div>
              <RadarChart axes={radarAxes} size={230} />
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-x-5 gap-y-3 content-center">
              {[
                { label: "Performance", val: s.performance, icon: <Flame size={12} /> },
                { label: "Comfort", val: s.comfort, icon: <Sparkles size={12} /> },
                { label: "Interior", val: s.interior, icon: <Star size={12} /> },
                { label: "Technology", val: s.technology, icon: <Video size={12} /> },
                { label: "Safety", val: s.safety, icon: <Shield size={12} /> },
                { label: "Ownership", val: s.ownership, icon: <Clock size={12} /> },
                { label: "Value", val: s.value, icon: <TrendingUp size={12} /> },
                { label: "Awards", val: wonAwards.length, icon: <Trophy size={12} />, raw: true },
              ].map((c) => (
                <div key={c.label}>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                    <span className="text-accent-400">{c.icon}</span>{c.label}
                  </div>
                  {c.raw ? (
                    <div className="text-2xl font-mono font-bold text-amber-300">{c.val}</div>
                  ) : (
                    <ScoreBar score={c.val} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="panel p-2">
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all " +
                  (active ? "bg-accent-500/20 text-accent-300" : "text-slate-400 hover:text-slate-200 hover:bg-base-850")
                }
              >
                {t.icon}{t.label}
                {t.id === "awards" && wonAwards.length > 0 && (
                  <span className="ml-1 text-[10px] bg-amber-500/20 text-amber-300 px-1.5 rounded-full">{wonAwards.length}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger">
          <Section title="Score Profile" icon={<GitCompare size={16} />}>
            <div className="flex flex-col items-center">
              <RadarChart axes={radarAxes} size={260} />
              <div className="grid grid-cols-4 gap-2 mt-3 w-full">
                {radarAxes.map((a) => (
                  <div key={a.label} className="text-center">
                    <div className="text-[10px] text-slate-500">{a.label}</div>
                    <div className="font-mono text-xs text-accent-300">{a.value.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
          <div className="space-y-4">
            <Section title="Performance Scores" icon={<Flame size={16} />}><ScoreGrid scores={review.scores.performance} title="Dynamics" /></Section>
            <Section title="Comfort Scores" icon={<Sparkles size={16} />}><ScoreGrid scores={review.scores.comfort} title="Cabin Comfort" /></Section>
          </div>
          <Section title="Interior Scores" icon={<Star size={16} />}><ScoreGrid scores={review.scores.interior} title="Cabin Quality" /></Section>
          <Section title="Technology Scores" icon={<Video size={16} />}><ScoreGrid scores={review.scores.technology} title="Digital" /></Section>
          <Section title="Safety Scores" icon={<Shield size={16} />}><ScoreGrid scores={review.scores.safety} title="Protection" /></Section>
          <Section title="Ownership & Value" icon={<Clock size={16} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ScoreGrid scores={review.scores.ownership} title="Long-Term" />
              <ScoreGrid scores={review.scores.value} title="Value" />
            </div>
          </Section>
        </div>
      )}

      {/* Magazines */}
      {tab === "magazines" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger">
          {review.magazines.map((m) => <MagCard key={m.magId} review={m} />)}
        </div>
      )}

      {/* Customers */}
      {tab === "customers" && (
        <Section title="Customer Reviews" icon={<Users size={16} />}>
          <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-base-850 border border-base-800">
            <div className="flex items-center gap-3">
              <div className="text-4xl font-mono font-bold text-amber-300">{avgStars.toFixed(1)}</div>
              <div>
                <StarRow n={Math.round(avgStars)} />
                <div className="text-[10px] text-slate-500 mt-0.5">{review.customerReviews.length} verified owners</div>
              </div>
            </div>
            <div className="flex items-end gap-1 h-10">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = review.customerReviews.filter((c) => c.stars === star).length;
                const pct = (count / review.customerReviews.length) * 100;
                return (
                  <div key={star} className="flex flex-col items-center gap-1" style={{ width: 28 }}>
                    <div className="w-5 bg-amber-500/60 rounded-sm" style={{ height: Math.max(pct, 4) + "%" }} />
                    <span className="text-[9px] text-slate-500 font-mono">{star}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger">
            {review.customerReviews.map((c, i) => (
              <div key={i} className="bg-base-850 border border-base-800 rounded-xl p-3 transition-all duration-300 hover:border-base-700 hover:bg-base-800/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-base-800 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                      {c.author.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-300">{c.author}</div>
                      <StarRow n={c.stars} />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-600">Verified Owner</span>
                </div>
                <div className="text-xs font-medium text-slate-200 mb-1">{c.title}</div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{c.body}</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(c.categories).map(([k, v]) => (
                    <span key={k} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-base-800 text-slate-400">
                      {k}: <span className={v >= 7 ? "text-ok-300" : v >= 5 ? "text-warn-300" : "text-danger-300"}>{v.toFixed(1)}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Long-term */}
      {tab === "longterm" && (
        <Section title={"Long-Term Ownership — " + review.longTerm.years + " Years"} icon={<Clock size={16} />}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-base-850 rounded-xl p-3 border border-base-800 flex flex-col items-center justify-center">
              <RadialGauge value={(review.longTerm.engineReliability + review.longTerm.suspensionDurability + review.longTerm.electronicsFailures) / 3} label="Durability" size={150} />
              <div className="mt-2 text-2xl font-mono font-bold text-accent-300">{review.longTerm.reliabilityGrade}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Reliability Grade</div>
            </div>
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-2 content-center">
              <StatTile label="Engine Reliability" value={review.longTerm.engineReliability.toFixed(1)} unit="/10" accent="ok" />
              <StatTile label="Suspension Durability" value={review.longTerm.suspensionDurability.toFixed(1)} unit="/10" />
              <StatTile label="Electronics" value={review.longTerm.electronicsFailures.toFixed(1)} unit="/10" />
              <StatTile label="Rust Resistance" value={review.longTerm.rustResistance.toFixed(1)} unit="/10" />
              <StatTile label="Interior Wear" value={review.longTerm.interiorWear.toFixed(1)} unit="/10" />
              <StatTile label="Battery Health" value={review.longTerm.batteryHealth.toFixed(1)} unit="/10" accent="ok" />
              <StatTile label="Resale Retention" value={review.longTerm.resaleRetention} unit="%" accent="accent" />
            </div>
          </div>
          <div className="mb-4">
            <div className="label-mono text-slate-500 mb-2">Wear Breakdown</div>
            <div className="space-y-2">
              {[
                { label: "Engine", val: review.longTerm.engineReliability },
                { label: "Suspension", val: review.longTerm.suspensionDurability },
                { label: "Electronics", val: review.longTerm.electronicsFailures },
                { label: "Rust Resistance", val: review.longTerm.rustResistance },
                { label: "Interior Wear", val: review.longTerm.interiorWear },
                { label: "Battery Health", val: review.longTerm.batteryHealth },
              ].map((m) => (
                <div key={m.label} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-28 shrink-0">{m.label}</span>
                  <div className="flex-1"><ScoreBar score={m.val} /></div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="label-mono text-slate-500 mb-2">Owner Reports</div>
            <ul className="space-y-1.5">
              {review.longTerm.notes.map((n, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400 bg-base-850 border border-base-800 rounded-lg px-3 py-2">
                  <Clock size={12} className="text-warn-400 mt-0.5 shrink-0" />
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {/* Influencers */}
      {tab === "influencers" && (
        <Section title="YouTube & Social Media" icon={<Video size={16} />}>
          <div className="space-y-3">
            {review.influencers.map((inf, i) => (
              <div key={i} className="bg-base-850 border border-base-800 rounded-xl p-3 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-500/30 to-base-700 flex items-center justify-center text-slate-300 font-bold text-sm shrink-0">
                  {inf.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-200">{inf.name}</span>
                    <span className="text-[11px] text-slate-500">@{inf.channel}</span>
                    <span className="text-[10px] text-slate-500">{inf.subscribers} subs</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-base-800 text-slate-400">{inf.niche}</span>
                    {inf.viral && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-300 border border-orange-500/30 flex items-center gap-0.5"><Flame size={9} />Viral</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{inf.verdict}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className={"text-xs font-mono font-semibold " + (inf.demandImpact >= 0 ? "text-ok-300" : "text-danger-300")}>
                    {inf.demandImpact >= 0 ? "+" : ""}{inf.demandImpact}%
                  </div>
                  <div className="text-[10px] text-slate-600">demand</div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Comparison */}
      {tab === "comparison" && (
        <Section title="Comparison Test" icon={<GitCompare size={16} />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="bg-base-850 rounded-xl p-3 border border-base-800">
              <div className="label-mono mb-2">Category Breakdown</div>
              <BarCompare rows={review.comparison.rows} labels={[carName, ...review.comparison.competitors]} highlight={0} />
            </div>
            <div className="bg-base-850 rounded-xl p-3 border border-base-800 flex flex-col">
              <div className="label-mono mb-2">Final Standings</div>
              <Podium winners={[{ name: carName, score: compTotals[0], you: true }, ...review.comparison.competitors.map((c, i) => ({ name: c, score: compTotals[i + 1], you: false }))]} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-base-800">
                  <th className="text-left py-2 px-3 label-mono text-slate-500">Category</th>
                  <th className="text-center py-2 px-3 label-mono text-accent-300">{carName}</th>
                  {review.comparison.competitors.map((c) => (
                    <th key={c} className="text-center py-2 px-3 label-mono text-slate-400">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {review.comparison.rows.map((r) => {
                  const allVals = [r.yours, ...r.competitors];
                  const best = Math.max(...allVals);
                  return (
                    <tr key={r.category} className="border-b border-base-800/50">
                      <td className="py-2 px-3 text-slate-400">{r.category}</td>
                      <td className={"text-center py-2 px-3 font-mono font-semibold " + (r.yours === best ? "text-ok-300" : "text-slate-300")}>
                        {r.yours.toFixed(1)}{r.yours === best && <span className="text-[9px] ml-1">★</span>}
                      </td>
                      {r.competitors.map((c, i) => (
                        <td key={i} className={"text-center py-2 px-3 font-mono " + (c === best ? "text-ok-300 font-semibold" : "text-slate-400")}>
                          {c.toFixed(1)}{c === best && <span className="text-[9px] ml-1">★</span>}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-base-700 bg-base-850/50">
                  <td className="py-2 px-3 font-semibold text-slate-300">Overall</td>
                  <td className={"text-center py-2 px-3 font-mono font-bold " + (review.comparison.winnerIndex === 0 ? "text-amber-300" : "text-slate-300")}>
                    {compTotals[0].toFixed(1)}
                  </td>
                  {review.comparison.competitors.map((_, i) => (
                    <td key={i} className={"text-center py-2 px-3 font-mono font-bold " + (review.comparison.winnerIndex === i + 1 ? "text-amber-300" : "text-slate-400")}>
                      {compTotals[i + 1].toFixed(1)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-center text-sm font-medium">
            {review.comparison.winnerIndex === 0 ? (
              <span className="text-amber-300 flex items-center justify-center gap-1.5"><Trophy size={15} /> {carName} wins the comparison test</span>
            ) : (
              <span className="text-slate-400">{review.comparison.competitors[review.comparison.winnerIndex - 1]} wins this round</span>
            )}
          </div>
        </Section>
      )}

      {/* Awards */}
      {tab === "awards" && (
        <Section title="Industry Awards" icon={<Trophy size={16} />}>
          {wonAwards.length > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-transparent border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-300">
                <Trophy size={18} />
                <span className="font-semibold">{wonAwards.length} award{wonAwards.length > 1 ? "s" : ""} won</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Awards boost market demand and brand prestige.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {review.awards.map((a) => (
              <div
                key={a.name}
                className={"flex items-start gap-3 p-3 rounded-xl border transition-all " + (a.won ? "bg-amber-500/10 border-amber-500/40" : "bg-base-850 border-base-800 opacity-50")}
              >
                <Trophy size={18} className={a.won ? "text-amber-300 shrink-0" : "text-slate-600 shrink-0"} />
                <div className="flex-1">
                  <div className={"text-sm font-medium " + (a.won ? "text-amber-200" : "text-slate-400")}>{a.name}</div>
                  <div className="text-[11px] text-slate-500">{a.description}</div>
                </div>
                {a.won && <span className="text-[10px] text-ok-300 bg-ok-500/15 px-2 py-0.5 rounded-full shrink-0">WON</span>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Reliability */}
      {tab === "reliability" && (
        <Section title="Reliability Ranking" icon={<Shield size={16} />}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-base-850 rounded-xl p-4 border border-base-800 flex flex-col items-center justify-center">
              <RadialGauge value={gradeToScore(review.reliability.grade)} max={10} label="Score" size={150} />
              <div className="mt-2 text-4xl font-mono font-bold text-accent-300">{review.reliability.grade}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Reliability Grade</div>
            </div>
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-2 content-center">
              <StatTile label="Engine Failures" value={review.reliability.engineFailures} sub="per 1k units" accent={review.reliability.engineFailures < 15 ? "ok" : "danger"} />
              <StatTile label="Transmission Issues" value={review.reliability.transmissionIssues} sub="per 1k units" />
              <StatTile label="Electronics Problems" value={review.reliability.electronicsProblems} sub="per 1k units" accent={review.reliability.electronicsProblems < 20 ? "ok" : "warn"} />
              <StatTile label="Warranty Claims" value={review.reliability.warrantyClaims} sub="per 1k units" />
              <StatTile label="Recall Frequency" value={review.reliability.recallFrequency} sub="expected" accent={review.reliability.recallFrequency < 3 ? "ok" : "warn"} />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-base-850 border border-base-800">
            <div className="label-mono mb-2">Incident Comparison (lower is better)</div>
            <div className="space-y-2">
              {[
                { label: "Engine Failures", val: review.reliability.engineFailures, max: 100 },
                { label: "Transmission Issues", val: review.reliability.transmissionIssues, max: 80 },
                { label: "Electronics Problems", val: review.reliability.electronicsProblems, max: 120 },
                { label: "Warranty Claims", val: review.reliability.warrantyClaims, max: 100 },
                { label: "Recall Frequency", val: review.reliability.recallFrequency, max: 50 },
              ].map((m) => {
                const pct = Math.min(100, (m.val / m.max) * 100);
                const good = pct < 30;
                return (
                  <div key={m.label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-36 shrink-0">{m.label}</span>
                    <div className="flex-1 h-2 bg-base-800 rounded-full overflow-hidden">
                      <div className={"h-full rounded-full " + (good ? "bg-ok-500" : pct < 60 ? "bg-warn-500" : "bg-danger-500")} style={{ width: pct + "%" }} />
                    </div>
                    <span className={"text-[10px] font-mono w-8 text-right " + (good ? "text-ok-300" : "text-slate-400")}>{m.val}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3">
            Grades range from <span className="text-ok-300 font-mono">A+</span> (exceptional) to <span className="text-danger-300 font-mono">F</span> (unreliable). Lower incident counts indicate better long-term durability.
          </div>
        </Section>
      )}
    </div>
  );
}
