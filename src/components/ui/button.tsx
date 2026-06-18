import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type Variant = "default" | "outline" | "ghost" | "danger";

const variantClass: Record<Variant, string> = {
  default: "bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold shadow-md shadow-blue-950/20 border border-blue-500/20",
  outline: "border border-white/[0.06] bg-transparent text-text-primary hover:bg-bg-tertiary hover:border-accent-gold/30 hover:text-accent-gold",
  ghost: "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/60",
  danger: "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 font-semibold",
};

export const Button = ({
  className,
  variant = "default",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) => (
  <button
    type="button"
    className={cn(
      "inline-flex items-center justify-center rounded px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-150",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-gold/40",
      "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
      variantClass[variant],
      className,
    )}
    {...props}
  />
);
