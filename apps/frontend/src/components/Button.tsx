import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../utils/className";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[#2563EB] text-white hover:bg-blue-700 shadow-sm hover:shadow-[0_8px_20px_rgba(37,99,235,0.16)]",
  secondary: "border border-slate-200 bg-[#F1F5F9] text-slate-800 hover:bg-slate-200",
  ghost: "bg-transparent text-[#2563EB] hover:bg-blue-50",
  danger: "bg-red-50 text-red-700 hover:bg-red-100"
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  fullWidth?: boolean;
  icon?: string;
  variant?: ButtonVariant;
}

export function Button({ children, className, fullWidth, icon, type = "button", variant = "primary", ...props }: ButtonProps) {
  return (
    <button className={cn(baseClasses, variantClasses[variant], fullWidth && "w-full", className)} type={type} {...props}>
      {icon && <span className="material-symbols-outlined text-[20px]">{icon}</span>}
      {children}
    </button>
  );
}

interface LinkButtonProps extends Omit<ComponentProps<typeof Link>, "children" | "className" | "to"> {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  icon?: string;
  to: string;
  variant?: ButtonVariant;
}

export function LinkButton({ children, className, fullWidth, icon, to, variant = "primary", ...props }: LinkButtonProps) {
  return (
    <Link className={cn(baseClasses, variantClasses[variant], fullWidth && "w-full", className)} to={to} {...props}>
      {icon && <span className="material-symbols-outlined text-[20px]">{icon}</span>}
      {children}
    </Link>
  );
}
