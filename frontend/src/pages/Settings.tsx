import { LogOut, Monitor, RotateCcw } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { SelectField } from "../components/ui/FormField";
import { MissingApiNotice } from "../components/ui/States";
import { usePreferences } from "../hooks/usePreferences";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { PAGE_SIZE_OPTIONS } from "../context/PreferencesContext";

export default function Settings() {
  const { preferences, updatePreferences, resetPreferences } = usePreferences();
  const { logout } = useAuth();
  const toast = useToast();

  return (
    <>
      <PageHeader title="Settings" description="Display preferences and account options." />
      <div className="space-y-6">
        <Card>
          <CardHeader
            title="Display preferences"
            description={
              <span className="inline-flex items-center gap-1.5">
                <Monitor className="h-3.5 w-3.5" aria-hidden /> Saved in this browser only, not on your account.
              </span>
            }
          />
          <div className="grid gap-6 p-5 sm:grid-cols-2">
            <SelectField
              label="Rows per page"
              hint="Used by the patients table."
              value={preferences.pageSize}
              onChange={(e) => {
                updatePreferences({ pageSize: Number(e.target.value) });
                toast.success("Preference saved");
              }}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </SelectField>

            <fieldset>
              <legend className="mb-1.5 block text-sm font-medium text-slate-700">Sidebar</legend>
              <label className="flex h-10 items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 accent-brand-600"
                  checked={preferences.sidebarCollapsed}
                  onChange={(e) => updatePreferences({ sidebarCollapsed: e.target.checked })}
                />
                Collapse the sidebar on large screens
              </label>
            </fieldset>
          </div>
          <div className="flex justify-end border-t border-slate-100 px-5 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetPreferences();
                toast.info("Preferences reset to defaults");
              }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden /> Reset to defaults
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Account" />
          <div className="space-y-4 p-5">
            <MissingApiNotice title="Password and email changes aren't available yet">
              Changing your password or email needs a backend endpoint such as{" "}
              <code className="rounded bg-amber-100 px-1">PUT /auth/password</code>.
            </MissingApiNotice>
            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Sign out</p>
                <p className="text-sm text-slate-500">Removes your session token from this browser.</p>
              </div>
              <Button variant="secondary" onClick={() => logout("manual")}>
                <LogOut className="h-4 w-4" aria-hidden /> Sign out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
