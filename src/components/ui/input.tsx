import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      "w-full rounded border border-white/[0.06] bg-[#05070c] px-3 py-2 text-xs font-mono text-text-primary transition-all duration-150",
      "placeholder:text-text-muted focus-visible:outline-none focus-visible:border-accent-gold/40 focus-visible:bg-[#070b13]",
      className,
    )}
    {...props}
  />
);
