import { useEffect, useState } from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardHeader } from "../components/ui/Card";
import { MissingApiNotice } from "../components/ui/States";
import { Avatar } from "../components/layout/Avatar";
import { useAuth } from "../hooks/useAuth";

function formatRemaining(ms: number) {
  if (ms <= 0) return "Expired";
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "Less than a minute";
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export default function Profile() {
  const { user } = useAuth();
  const [now, setNow] = useState(Date.now());

  // Refresh the "time remaining" display every 30 seconds.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  if (!user) return null;

  return (
    <>
      <PageHeader title="Profile" description="Your account and current session." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center p-6 text-center">
          <Avatar name={user.username} size="lg" />
          <p className="mt-4 text-lg font-semibold text-slate-900">{user.username}</p>
          <p className="text-sm text-slate-500">Signed in</p>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Account details" />
            <dl className="divide-y divide-slate-100">
              <div className="grid gap-1 px-5 py-3.5 sm:grid-cols-3">
                <dt className="text-sm text-slate-500">Username</dt>
                <dd className="text-sm text-slate-900 sm:col-span-2">{user.username}</dd>
              </div>
              <div className="grid gap-1 px-5 py-3.5 sm:grid-cols-3">
                <dt className="text-sm text-slate-500">Session expires</dt>
                <dd className="text-sm text-slate-900 sm:col-span-2">
                  {new Date(user.expiresAt).toLocaleString()}{" "}
                  <span className="text-slate-500">({formatRemaining(user.expiresAt - now)} left)</span>
                </dd>
              </div>
            </dl>
          </Card>

          <MissingApiNotice title="Email and profile editing aren't available yet">
            Your username and session details come from your sign-in token. Showing your email or editing your profile
            needs endpoints such as <code className="rounded bg-amber-100 px-1">GET /auth/me</code> and{" "}
            <code className="rounded bg-amber-100 px-1">PUT /auth/me</code>.
          </MissingApiNotice>
        </div>
      </div>
    </>
  );
}
