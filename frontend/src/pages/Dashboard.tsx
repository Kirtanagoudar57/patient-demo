import { Link } from "react-router-dom";
import { Activity, Baby, ClipboardList, Plus, Stethoscope, UserPlus, Users } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardHeader } from "../components/ui/Card";
import { buttonStyles } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState, ErrorState, MissingApiNotice } from "../components/ui/States";
import { StatCard } from "../components/dashboard/StatCard";
import { AgeDistributionChart, ConditionsChart } from "../components/dashboard/Charts";
import { PatientsTable } from "../components/tables/PatientsTable";
import { useAsync } from "../hooks/useAsync";
import { useAuth } from "../hooks/useAuth";
import { dashboardService } from "../services/dashboardService";
import { GENDERS } from "../types/patient";

function percent(part: number, total: number) {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="space-y-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <Skeleton className="h-64 w-full" />
        </Card>
        <Card className="p-5">
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, error, loading, reload } = useAsync(() => dashboardService.getPatientStats(), []);

  const quickActions = (
    <>
      <Link to="/patients?new=1" className={buttonStyles("primary")}>
        <Plus className="h-4 w-4" aria-hidden /> Add patient
      </Link>
      <Link to="/patients" className={buttonStyles("secondary")}>
        <Stethoscope className="h-4 w-4" aria-hidden /> View patients
      </Link>
      <Link to="/users" className={buttonStyles("secondary")}>
        <UserPlus className="h-4 w-4" aria-hidden /> Create user
      </Link>
    </>
  );

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.username ?? ""}`}
        description="An overview of the patient records in your database."
        actions={quickActions}
      />

      {loading && !stats ? (
        <DashboardSkeleton />
      ) : error || !stats ? (
        <Card>
          <ErrorState message={error ?? "Unknown error"} onRetry={reload} />
        </Card>
      ) : stats.total === 0 ? (
        <Card>
          <EmptyState
            icon={Stethoscope}
            title="No patient records yet"
            description="Statistics and charts will appear here once you add patients."
            action={
              <Link to="/patients?new=1" className={buttonStyles("primary", "sm")}>
                <Plus className="h-4 w-4" aria-hidden /> Add your first patient
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total patients" value={stats.total} icon={Stethoscope} footnote="All records in the database" />
            <StatCard
              label="Adults"
              value={stats.adults}
              icon={Users}
              footnote={`${percent(stats.adults, stats.total)}% of patients · age 18+`}
            />
            <StatCard
              label="Minors"
              value={stats.minors}
              icon={Baby}
              footnote={`${percent(stats.minors, stats.total)}% of patients · under 18`}
            />
            <StatCard
              label="With a recorded condition"
              value={stats.withCondition}
              icon={ClipboardList}
              footnote={`${percent(stats.withCondition, stats.total)}% of patients`}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Patients by age group" description="Number of patients in each age range" />
              <div className="p-5">
                <AgeDistributionChart data={stats.byAgeGroup} />
              </div>
            </Card>
            <Card>
              <CardHeader title="Most common conditions" description="Top conditions across all patients" />
              <div className="p-5">
                {stats.topConditions.length ? (
                  <ConditionsChart data={stats.topConditions} />
                ) : (
                  <EmptyState
                    icon={ClipboardList}
                    title="No conditions recorded"
                    description="Patients don't have a condition filled in yet."
                    className="h-64 py-0"
                  />
                )}
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent records */}
            <Card className="lg:col-span-2">
              <CardHeader
                title="Latest patient records"
                description="Highest patient IDs (the backend has no created-at date)"
                action={
                  <Link to="/patients" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                    View all
                  </Link>
                }
              />
              <PatientsTable patients={stats.latest} />
            </Card>

            {/* Gender breakdown + unavailable metrics */}
            <div className="space-y-6">
              <Card>
                <CardHeader title="Gender breakdown" />
                <ul className="space-y-4 p-5">
                  {GENDERS.map((g) => {
                    const count = stats.byGender[g];
                    const pct = percent(count, stats.total);
                    return (
                      <li key={g}>
                        <div className="mb-1.5 flex justify-between text-sm">
                          <span className="text-slate-700">{g}</span>
                          <span className="tabular-nums text-slate-500">
                            {count} · {pct}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden>
                          <div className="h-full rounded-full bg-[#2a78d6]" style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>
              <Card className="space-y-3 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Activity className="h-4 w-4 text-slate-500" aria-hidden /> Users & activity
                </div>
                <MissingApiNotice title="Not available from the backend">
                  Total users, active users and recent activity need endpoints that don't exist yet (for example{" "}
                  <code className="rounded bg-amber-100 px-1">GET /users</code>).
                </MissingApiNotice>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
