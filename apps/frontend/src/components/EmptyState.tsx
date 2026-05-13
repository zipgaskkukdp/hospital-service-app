interface EmptyStateProps {
  action?: React.ReactNode;
  description?: string;
  icon?: string;
  title: string;
}

export function EmptyState({ action, description, icon = "inbox", title }: EmptyStateProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
      <span className="material-symbols-outlined text-[36px] text-slate-400">{icon}</span>
      <h3 className="mt-3 text-lg font-semibold text-slate-950">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
