import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { Bot, AlertTriangle, Zap } from "lucide-react";
import { getApexKnowledge, getImpactBadges, type ApexKnowledgeEntry } from "../../sim/apexKnowledge";

interface ApexTooltipProps {
  /** The label text to look up in the knowledge database */
  label: string;
  /** Override knowledge entry (optional — falls back to auto-lookup) */
  entry?: ApexKnowledgeEntry | null;
  /** Children to wrap (the info icon trigger) */
  children?: ReactNode;
}

export function ApexTooltip({ label, entry: overrideEntry, children }: ApexTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<"above" | "below">("above");
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const knowledge = overrideEntry ?? getApexKnowledge(label);

  const show = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    // Calculate position
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      setPosition(spaceAbove > 280 || spaceAbove > spaceBelow ? "above" : "below");
    }
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  if (!knowledge) return null;

  const impactBadges = getImpactBadges(knowledge.impacts);

  return (
    <span
      ref={triggerRef}
      className="apex-info-trigger"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      tabIndex={0}
      aria-label={`Info about ${label}`}
    >
      {children || (
        <span className="apex-info-icon" title={`Learn about ${label}`}>
          ℹ
        </span>
      )}

      {visible && (
        <div
          ref={tooltipRef}
          className={`apex-tooltip ${position === "above" ? "apex-tooltip-above" : "apex-tooltip-below"}`}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          {/* Arrow */}
          <div className={`apex-tooltip-arrow ${position === "above" ? "apex-tooltip-arrow-below" : "apex-tooltip-arrow-above"}`} />

          {/* Header */}
          <div className="apex-tooltip-header">
            <div className="apex-tooltip-bot-icon">
              <Bot size={13} />
            </div>
            <div className="apex-tooltip-title">
              <span className="apex-tooltip-label">Apex AI — {label}</span>
              <span className="apex-tooltip-sub">Tutorial Guide</span>
            </div>
          </div>

          {/* Tutorial text */}
          <div className="apex-tooltip-body">
            {knowledge.tutorial}
          </div>

          {/* Impact badges */}
          <div className="apex-tooltip-impacts">
            <span className="apex-tooltip-impacts-label">Affects:</span>
            <div className="apex-tooltip-badges">
              {impactBadges.map((badge) => (
                <span
                  key={badge.label}
                  className={`apex-tooltip-badge ${badge.color}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          </div>

          {/* AI Tip */}
          <div className="apex-tooltip-tip">
            <Zap size={11} className="apex-tooltip-tip-icon" />
            <span>{knowledge.tip}</span>
          </div>

          {/* Danger Zone */}
          {knowledge.dangerZone && (
            <div className="apex-tooltip-danger">
              <AlertTriangle size={11} className="apex-tooltip-danger-icon" />
              <span>{knowledge.dangerZone}</span>
            </div>
          )}
        </div>
      )}
    </span>
  );
}
