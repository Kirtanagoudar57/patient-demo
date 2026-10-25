import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Search, SearchX, Stethoscope, X } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { inputClass } from "../components/ui/FormField";
import { TableSkeleton } from "../components/ui/Skeleton";
import { EmptyState, ErrorState } from "../components/ui/States";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PatientsTable, sortPatients, type SortState } from "../components/tables/PatientsTable";
import { PatientFormDialog } from "../components/forms/PatientFormDialog";
import { useAsync } from "../hooks/useAsync";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { usePreferences } from "../hooks/usePreferences";
import { useToast } from "../hooks/useToast";
import { patientService } from "../services/patientService";
import { getErrorMessage } from "../services/api";
import { GENDERS, type Gender, type Patient } from "../types/patient";

export default function Patients() {
  const toast = useToast();
  const { preferences } = usePreferences();
  const pageSize = preferences.pageSize;
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters (sent to GET /patients)
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [age, setAge] = useState("");
  const [page, setPage] = useState(0);
  const debouncedName = useDebouncedValue(name);
  const debouncedAge = useDebouncedValue(age);

  // Client-side sort of the current page (the backend has no sort parameter).
  const [sort, setSort] = useState<SortState>({ key: "id", direction: "asc" });

  // Dialogs
  const [formOpen, setFormOpen] = useState(searchParams.get("new") === "1");
  const [editing, setEditing] = useState<Patient | undefined>();
  const [deleting, setDeleting] = useState<Patient | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Dashboard "Add patient" links here with ?new=1; drop the flag once handled.
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setFormOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Any filter change starts again from the first page.
  useEffect(() => setPage(0), [debouncedName, gender, debouncedAge, pageSize]);

  const ageNumber = debouncedAge.trim() === "" ? undefined : Number(debouncedAge);

  // Ask for one extra row so we know whether a next page exists
  // (the API returns a plain list without a total count).
  const { data, error, loading, reload } = useAsync(
    () =>
      patientService.list({
        name: debouncedName,
        gender,
        age: ageNumber,
        skip: page * pageSize,
        limit: pageSize + 1,
      }),
    [debouncedName, gender, ageNumber, page, pageSize],
  );

  const hasNext = (data?.length ?? 0) > pageSize;
  const rows = useMemo(() => sortPatients((data ?? []).slice(0, pageSize), sort), [data, pageSize, sort]);
  const hasFilters = Boolean(name || gender || age);

  const clearFilters = () => {
    setName("");
    setGender("");
    setAge("");
  };

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await patientService.remove(deleting.id);
      toast.success("Patient deleted", `${deleting.name} (#${deleting.id}) was removed.`);
      setDeleting(null);
      // If that was the last row on this page, step back one page.
      if (rows.length === 1 && page > 0) setPage((p) => p - 1);
      else reload();
    } catch (err) {
      toast.error("Couldn't delete patient", getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Patients"
        description="Search, review and manage patient records."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden /> Add patient
          </Button>
        }
      />

      <Card>
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center">
          <div className="relative md:max-w-xs md:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Search by name…"
              aria-label="Search patients by name"
              className={inputClass("pl-9")}
            />
          </div>
          <div className="flex gap-3">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender | "")}
              aria-label="Filter by gender"
              className={inputClass("md:w-40")}
            >
              <option value="">All genders</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Age"
              aria-label="Filter by exact age"
              className={inputClass("w-24")}
            />
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="self-start md:self-auto">
              <X className="h-4 w-4" aria-hidden /> Clear
            </Button>
          )}
        </div>

        {/* Body */}
        {loading && !data ? (
          <TableSkeleton rows={Math.min(pageSize, 8)} />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : rows.length === 0 ? (
          hasFilters ? (
            <EmptyState
              icon={SearchX}
              title="No matching patients"
              description="Try a different name, gender or age."
              action={
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Stethoscope}
              title={page > 0 ? "No more patients" : "No patients yet"}
              description={page > 0 ? "You've reached the end of the list." : "Add your first patient record to get started."}
              action={
                page > 0 ? (
                  <Button variant="secondary" size="sm" onClick={() => setPage(0)}>
                    Back to first page
                  </Button>
                ) : (
                  <Button size="sm" onClick={openCreate}>
                    <Plus className="h-4 w-4" aria-hidden /> Add patient
                  </Button>
                )
              }
            />
          )
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : undefined} aria-busy={loading}>
            <PatientsTable
              patients={rows}
              sort={sort}
              onSortChange={setSort}
              onEdit={(patient) => {
                setEditing(patient);
                setFormOpen(true);
              }}
              onDelete={setDeleting}
            />
          </div>
        )}

        {/* Pagination */}
        {!error && (rows.length > 0 || page > 0) && (
          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              {rows.length > 0
                ? `Showing ${page * pageSize + 1}–${page * pageSize + rows.length}`
                : "No results on this page"}
              <span className="hidden sm:inline"> · Sorting applies to the current page</span>
            </p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" disabled={page === 0 || loading} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" aria-hidden /> Previous
              </Button>
              <span className="px-1 tabular-nums">Page {page + 1}</span>
              <Button variant="secondary" size="sm" disabled={!hasNext || loading} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <PatientFormDialog
        open={formOpen}
        patient={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          reload();
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete patient?"
        message={
          <>
            This permanently removes <span className="font-medium text-slate-900">{deleting?.name}</span> (#{deleting?.id})
            from the database. This can't be undone.
          </>
        }
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
