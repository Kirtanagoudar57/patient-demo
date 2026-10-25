import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, UserX } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState, ErrorState } from "../components/ui/States";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PatientFormDialog } from "../components/forms/PatientFormDialog";
import { useAsync } from "../hooks/useAsync";
import { useToast } from "../hooks/useToast";
import { patientService } from "../services/patientService";
import { ApiError, getErrorMessage } from "../services/api";

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 px-5 py-3.5 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900 sm:col-span-2">{value}</dd>
    </div>
  );
}

const muted = (text: string) => <span className="text-slate-400">{text}</span>;

export default function PatientDetails() {
  const { id } = useParams();
  const patientId = Number(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const validId = Number.isInteger(patientId) && patientId > 0;
  const { data: patient, error, loading, reload } = useAsync(
    () => (validId ? patientService.get(patientId) : Promise.reject(new ApiError("Patient not found", 404))),
    [patientId],
  );

  const backLink = (
    <Link to="/patients" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
      <ArrowLeft className="h-4 w-4" aria-hidden /> All patients
    </Link>
  );

  if (loading && !patient) {
    return (
      <div className="space-y-6">
        {backLink}
        <Skeleton className="h-8 w-56" />
        <Card className="space-y-4 p-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full max-w-md" />
          ))}
        </Card>
      </div>
    );
  }

  if (error || !patient) {
    const notFound = error === "Patient not found";
    return (
      <div className="space-y-6">
        {backLink}
        <Card>
          {notFound ? (
            <EmptyState
              icon={UserX}
              title="Patient not found"
              description={`There is no patient with ID ${id}.`}
              action={
                <Button variant="secondary" size="sm" onClick={() => navigate("/patients")}>
                  Back to patients
                </Button>
              }
            />
          ) : (
            <ErrorState message={error ?? "Unknown error"} onRetry={reload} />
          )}
        </Card>
      </div>
    );
  }

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await patientService.remove(patient.id);
      toast.success("Patient deleted", `${patient.name} (#${patient.id}) was removed.`);
      navigate("/patients", { replace: true });
    } catch (err) {
      toast.error("Couldn't delete patient", getErrorMessage(err));
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {backLink}
      <PageHeader
        title={patient.name}
        description={`Patient #${patient.id}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" aria-hidden /> Edit
            </Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" aria-hidden /> Delete
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader title="Patient information" />
        <dl className="divide-y divide-slate-100">
          <DetailRow label="Patient ID" value={<span className="tabular-nums">#{patient.id}</span>} />
          <DetailRow label="Full name" value={patient.name} />
          <DetailRow label="Age" value={<span className="tabular-nums">{patient.age}</span>} />
          <DetailRow
            label="Patient type"
            value={<Badge tone={patient.patient_type === "Minor" ? "amber" : "neutral"}>{patient.patient_type}</Badge>}
          />
          <DetailRow label="Gender" value={patient.gender} />
          <DetailRow label="Condition" value={patient.disease || muted("Not recorded")} />
          <DetailRow label="Guardian" value={patient.guardian_name || muted("None")} />
          <DetailRow label="Address" value={muted("Not stored by the backend")} />
        </dl>
      </Card>

      <PatientFormDialog
        open={editOpen}
        patient={patient}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setEditOpen(false);
          reload();
        }}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Delete patient?"
        message={
          <>
            This permanently removes <span className="font-medium text-slate-900">{patient.name}</span> (#{patient.id})
            from the database. This can't be undone.
          </>
        }
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
