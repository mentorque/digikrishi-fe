import { cn } from "@/lib/utils";

/** Small dot loader for use inside buttons only. */
export function DotLoader({ className }: { className?: string }) {
  return (
    <span
      className={cn("dot-loader inline-block", className)}
      role="status"
      aria-label="Loading"
    />
  );
}
