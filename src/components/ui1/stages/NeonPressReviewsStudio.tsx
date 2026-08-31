import React from "react";
import {
  Newspaper,
  Star,
  Quote,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonPressReviewsStudio() {
  const { sim, design } = useDesign();

  const reviews = [
    {
      outlet: "TOP GEAR",
      score: "10 / 10",
      headline: "A Cybernetic Masterpiece That Rewrites The Hypercar Rulebook",
      quote: "The acceleration defies physics, but it's the surgical precision of the active aerodynamic underbody that leaves your jaw pinned to the carbon floor.",
      author: "Chris Harris",
      badge: "CAR OF THE YEAR",
    },
    {
      outlet: "CAR AND DRIVER",
      score: "5 / 5 STARS",
      headline: "Astonishingly Fast, Razor Sharp, and Addictively Usable",
      quote: "0-60 MPH in under three seconds with zero drama. The dual-clutch transmission shifts with the speed of thought. Truly peerless engineering.",
      author: "Technical Editor",
      badge: "EDITORS' CHOICE",
    },
    {
      outlet: "EVO MAGAZINE",
      score: "5 / 5 STARS",
      headline: "The Ultimate Driver's Weapon for Track and Canyon Roads",
      quote: "Cornering grip that borders on teleportation. The feedback through the chassis gives you total confidence to push toward the limit.",
      author: "Jethro Bovingdon",
      badge: "BEST TRACK CAR",
    },
    {
      outlet: "MOTOR TREND",
      score: "9.8 / 10",
      headline: "The Future of High-Performance Automotive Architecture is Here",
      quote: "Equal parts sci-fi spaceship and road-crushing track missile. The structural rigidity and NVH refinement are unprecedented in this class.",
      author: "Senior Features Editor",
      badge: "GOLDEN CALIPER",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "GLOBAL MEDIA REVIEWS & MOTOR JOURNALISM FEED",
          subtitle: "Critic reviews, road test verdict scores, and world-first track impressions",
          icon: <Newspaper size={18} />,
          badge: <NeonHorizonBadge variant="live">CRITIC CONSENSUS: 99%</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="OVERALL MEDIA SCORE" value="9.9 / 10" accentColor="cyan" />
          <NeonHorizonDataCard label="GLOBAL HYPE RATING" value="98.5%" accentColor="gold" />
          <NeonHorizonDataCard label="TRACK VERDICT" value="RECORD BREAKER" accentColor="emerald" />
          <NeonHorizonDataCard label="ACCOLADES WON" value="7 AWARDS" accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((rev, idx) => (
          <NeonHorizonGlassPanel
            key={idx}
            variant="primary"
            corners="reticle"
            header={{
              title: rev.outlet,
              badge: <NeonHorizonBadge variant="cyan" size="xs">{rev.badge}</NeonHorizonBadge>,
              icon: <Award size={16} />,
            }}
            className="p-6 flex flex-col justify-between gap-4"
          >
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-100 nh-font-headline">
                  "{rev.headline}"
                </span>
                <span className="text-sm font-bold nh-font-mono text-amber-300 ml-2 whitespace-nowrap">
                  {rev.score}
                </span>
              </div>
              <p className="text-xs text-amber-200/70 leading-relaxed italic opacity-90">
                "{rev.quote}"
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[11px] nh-font-mono text-amber-300/60">
              <span>By {rev.author}</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={12} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
            </div>
          </NeonHorizonGlassPanel>
        ))}
      </div>
    </div>
  );
}
