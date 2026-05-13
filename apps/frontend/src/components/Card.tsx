import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/className";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-xl border border-slate-200 bg-white shadow-[0_4px_12px_rgba(15,23,42,0.05)]", className)}
      {...props}
    >
      {children}
    </div>
  );
}
