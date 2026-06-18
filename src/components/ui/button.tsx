import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type Variant = "default" | "outline" | "ghost" | "danger";

const variantClass: Record<Variant, string> = {
  default: "bg-accent-green text-slate-900 hover:bg-emerald-400 font-semibold",
  outline: "border border-border bg-transparent text-text-primary hover:bg-bg-tertiary",
  ghost: "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary",
  danger: "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25",
};

export const Button = ({
  className,
  variant = "default",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) => (
  <button
    type="button"
    className={cn(
      "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
      "disabled:opacity-50 disabled:pointer-events-none",
      variantClass[variant],
      className,
    )}
    {...props}
  />
);
