import type { InputHTMLAttributes } from "react";
import { cn } from "../utils/className";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helpText?: string;
  icon?: string;
  label?: string;
}

export function Input({ className, error, helpText, icon, id, label, name, ...props }: InputProps) {
  const inputId = id ?? name;

  return (
    <label className="block" htmlFor={inputId}>
      {label && <span className="label">{label}</span>}
      <span className="relative block">
        {icon && (
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[22px] text-slate-500">
            {icon}
          </span>
        )}
        <input className={cn("input h-12", icon && "pl-11", className)} id={inputId} name={name} {...props} />
      </span>
      {error && <span className="mt-2 block text-sm text-red-600">{error}</span>}
      {helpText && !error && <span className="mt-2 block text-sm text-slate-500">{helpText}</span>}
    </label>
  );
}
