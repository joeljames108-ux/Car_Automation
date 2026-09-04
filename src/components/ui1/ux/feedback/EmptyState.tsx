import React from "react";
export interface EmptyStateProps {
  icon?: React.ReactNode; title: string; description?: string;
  action?: { label: string; onClick: () => void }; className?: string;
}
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className = "" }) => (
  <div className={"flex flex-col items-center justify-center py-16 px-8 text-center "+className}>
    {icon && <div className="mb-4 text-amber-300/40">{icon}</div>}
    <h3 className="text-sm font-bold text-amber-100/80 mb-1">{title}</h3>
    {description && <p className="text-xs text-amber-300/50 max-w-xs mb-4">{description}</p>}
    {action && <button onClick={action.onClick} className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-semibold hover:bg-amber-500/30 transition-all cursor-pointer">{action.label}</button>}
  </div>
);
