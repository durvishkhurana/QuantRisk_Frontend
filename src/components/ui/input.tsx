import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      "w-full rounded-lg border border-border bg-bg-tertiary px-3 py-2 text-sm text-text-primary",
      "placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
      className,
    )}
    {...props}
  />
);
