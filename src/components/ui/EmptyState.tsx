import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  title,
  description,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center py-12 px-6",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-stone-500 max-w-sm">{description}</p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
