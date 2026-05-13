import { cn } from "../utils/className";

const badgeClasses: Record<string, string> = {
  AI_COMPLETED: "bg-blue-50 text-[#2563EB]",
  AI_FAILED: "bg-red-50 text-red-700",
  AI_PENDING: "bg-amber-50 text-amber-700",
  COMPLETED: "bg-blue-50 text-[#2563EB]",
  DRAFT: "bg-slate-100 text-slate-600",
  FAILED: "bg-red-50 text-red-700",
  HIGH: "bg-red-50 text-red-700",
  LOW: "bg-blue-50 text-[#2563EB]",
  MEDIUM: "bg-amber-50 text-amber-700",
  PENDING: "bg-amber-50 text-amber-700",
  SUBMITTED: "bg-blue-50 text-[#2563EB]",
  UNKNOWN: "bg-slate-100 text-slate-600"
};

interface StatusBadgeProps {
  className?: string;
  icon?: string;
  label?: string;
  value: string;
}

export function StatusBadge({ className, icon = "info", label, value }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold", badgeClasses[value] ?? "bg-slate-100 text-slate-600", className)}>
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
      {label ?? value}
    </span>
  );
}
