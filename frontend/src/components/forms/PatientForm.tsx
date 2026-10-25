import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Info } from "lucide-react";
import { TextField, SelectField } from "../ui/FormField";
import { Button } from "../ui/Button";
import { ApiError, getErrorMessage } from "../../services/api";
import { patientSchema, type PatientFormValues } from "../../lib/validation";
import { GENDERS, type Patient } from "../../types/patient";

interface PatientFormProps {
  /** When given, the form edits this patient; otherwise it creates one. */
  patient?: Patient;
  onSubmit: (values: PatientFormValues) => Promise<void>;
  onCancel: () => void;
}

const FIELD_NAMES = ["id", "name", "age", "gender", "disease", "guardian_name"] as const;

export function PatientForm({ patient, onSubmit, onCancel }: PatientFormProps) {
  const isEdit = Boolean(patient);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient
      ? {
          id: patient.id,
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          disease: patient.disease ?? "",
          guardian_name: patient.guardian_name ?? "",
        }
      : { name: "", disease: "", guardian_name: "" },
  });

  const age = watch("age");
  const isMinor = typeof age === "number" && age > 0 && age < 18;

  const submit = async (values: PatientFormValues) => {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          setError("id", { message: error.message });
          return;
        }
        // Show FastAPI 422 messages next to the matching inputs.
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          const name = FIELD_NAMES.find((f) => f === field);
          if (name) setError(name, { message });
        }
      }
      setFormError(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
      {formError && (
        <div className="flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {formError}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Patient ID"
          type="number"
          inputMode="numeric"
          min={1}
          required
          readOnly={isEdit}
          className={isEdit ? "bg-slate-50 text-slate-500" : undefined}
          hint={isEdit ? "IDs can't be changed." : "Must be unique."}
          error={errors.id?.message}
          {...register("id", { valueAsNumber: true })}
        />
        <TextField
          label="Age"
          type="number"
          inputMode="numeric"
          min={1}
          max={120}
          required
          error={errors.age?.message}
          {...register("age", { valueAsNumber: true })}
        />
      </div>

      <TextField label="Full name" autoComplete="off" required error={errors.name?.message} {...register("name")} />

      <SelectField label="Gender" required error={errors.gender?.message} defaultValue="" {...register("gender")}>
        <option value="" disabled>
          Select…
        </option>
        {GENDERS.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </SelectField>

      <TextField
        label="Condition"
        placeholder="e.g. Diabetes"
        hint="Optional."
        error={errors.disease?.message}
        {...register("disease")}
      />

      <TextField
        label="Guardian name"
        required={isMinor}
        hint={isMinor ? "Required because the patient is under 18." : "Required for patients under 18."}
        error={errors.guardian_name?.message}
        {...register("guardian_name")}
      />

      <p className="flex gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        <Info className="h-4 w-4 shrink-0" aria-hidden />
        Address isn't stored by the backend yet, so it isn't collected here.
      </p>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Save changes" : "Create patient"}
        </Button>
      </div>
    </form>
  );
}
