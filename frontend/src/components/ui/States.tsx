import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Inbox, PlugZap, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";
import { cn } from "../../lib/cn";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-5 w-5 text-slate-500" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {description && <div className="mt-1 max-w-sm text-sm text-slate-500">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div role="alert" className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-slate-900">Couldn't load this data</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          Try again
        </Button>
      )}
    </div>
  );
}

/** Explains that a feature needs a backend endpoint that doesn't exist yet. */
export function MissingApiNotice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <PlugZap className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
      <div className="text-sm">
        <p className="font-medium text-amber-900">{title}</p>
        <div className="mt-1 text-amber-800">{children}</div>
      </div>
    </div>
  );
}
