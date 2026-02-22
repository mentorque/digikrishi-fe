import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md bg-green-100 animate-pulse", className)}
      aria-hidden
      {...props}
    />
  );
}
