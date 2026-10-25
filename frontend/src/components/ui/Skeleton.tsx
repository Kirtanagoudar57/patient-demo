import { cn } from "../../lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-200/70", className)} aria-hidden />;
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="divide-y divide-slate-100" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-3.5">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className={cn("h-4", c === 1 ? "w-40" : "w-16", c > 2 && "hidden sm:block")} />
          ))}
        </div>
      ))}
    </div>
  );
}
