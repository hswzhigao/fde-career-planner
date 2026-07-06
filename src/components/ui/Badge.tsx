import type { ReactNode } from "react";

interface BadgeProps {
  className?: string;
  children: ReactNode;
}

export function Badge({ className, children }: BadgeProps) {
  return (
    <span
      className={[
        "bg-orange-100 text-orange-700 rounded-full px-2.5 py-0.5 text-xs font-medium",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
