import { cn } from "../utils/className";

interface PageHeaderProps {
  align?: "left" | "center";
  description?: string;
  icon?: string;
  title: string;
}

export function PageHeader({ align = "left", description, icon, title }: PageHeaderProps) {
  return (
    <div className={cn("mb-8", align === "center" && "text-center")}>
      {icon && (
        <div className={cn("mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#2563EB] text-white", align === "center" && "mx-auto")}>
          <span className="material-symbols-outlined text-[32px]">{icon}</span>
        </div>
      )}
      <h1 className="text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">{title}</h1>
      {description && <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">{description}</p>}
    </div>
  );
}
