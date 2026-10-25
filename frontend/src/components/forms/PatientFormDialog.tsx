import { Modal } from "../ui/Modal";
import { PatientForm } from "./PatientForm";
import { patientService } from "../../services/patientService";
import { useToast } from "../../hooks/useToast";
import type { Patient } from "../../types/patient";

interface PatientFormDialogProps {
  open: boolean;
  /** Patient to edit; leave undefined to create a new one. */
  patient?: Patient;
  onClose: () => void;
  onSaved: (patient: Patient) => void;
}

export function PatientFormDialog({ open, patient, onClose, onSaved }: PatientFormDialogProps) {
  const toast = useToast();
  const isEdit = Boolean(patient);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${patient?.name}` : "Add patient"}
      description={isEdit ? `Patient #${patient?.id}` : "Create a new patient record."}
    >
      {/* key resets the form when switching between patients */}
      <PatientForm
        key={patient?.id ?? "new"}
        patient={patient}
        onCancel={onClose}
        onSubmit={async (values) => {
          const saved = patient
            ? await patientService.update(patient.id, values)
            : await patientService.create(values);
          toast.success(isEdit ? "Patient updated" : "Patient created", `${saved.name} (#${saved.id})`);
          onSaved(saved);
        }}
      />
    </Modal>
  );
}
