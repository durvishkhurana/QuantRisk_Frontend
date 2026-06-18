import { cn } from "../../lib/utils";

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-lg bg-bg-tertiary", className)} aria-hidden />
);
