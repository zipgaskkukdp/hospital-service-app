import type { TextareaHTMLAttributes } from "react";
import { cn } from "../utils/className";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  helpText?: string;
  icon?: string;
  label?: string;
}

export function Textarea({ className, error, helpText, icon, id, label, name, ...props }: TextareaProps) {
  const inputId = id ?? name;

  return (
    <label className="block" htmlFor={inputId}>
      {label && (
        <span className="label inline-flex items-center gap-1">
          {icon && <span className="material-symbols-outlined text-[18px] text-[#2563EB]">{icon}</span>}
          {label}
        </span>
      )}
      <textarea className={cn("input min-h-40 resize-none leading-7", className)} id={inputId} name={name} {...props} />
      {error && <span className="mt-2 block text-sm text-red-600">{error}</span>}
      {helpText && !error && <span className="mt-2 block text-sm text-slate-500">{helpText}</span>}
    </label>
  );
}
