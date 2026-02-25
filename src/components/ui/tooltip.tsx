import * as React from "react";
import { cn } from "@/lib/utils";

export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}) {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <span className={cn("relative inline-flex group", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "absolute z-50 px-2.5 py-1.5 text-xs font-medium text-popover-foreground bg-popover border border-border rounded-md shadow-md whitespace-nowrap",
          "opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-150",
          positionClasses[side]
        )}
      >
        {content}
      </span>
    </span>
  );
}
