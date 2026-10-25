import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "../ui/Card";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  footnote?: ReactNode;
}

export function StatCard({ label, value, icon: Icon, footnote }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
          <Icon className="h-[18px] w-[18px] text-slate-600" aria-hidden />
        </div>
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>
      {footnote && <p className="mt-1 text-xs text-slate-500">{footnote}</p>}
    </Card>
  );
}
