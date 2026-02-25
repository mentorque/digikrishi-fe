import { cn } from "@/lib/utils";

export function Loader({ className }: { className?: string }) {
  return <div className={cn("loader-spinner", className)} role="status" aria-label="Loading" />;
}

export function PageLoader({ message }: { message?: string } = {}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <Loader />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
