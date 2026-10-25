import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/cn";
import type { Patient } from "../../types/patient";

export type SortKey = "id" | "name" | "age" | "gender" | "disease";
export interface SortState {
  key: SortKey;
  direction: "asc" | "desc";
}

interface PatientsTableProps {
  patients: Patient[];
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
}

export function sortPatients(patients: Patient[], sort: SortState): Patient[] {
  const factor = sort.direction === "asc" ? 1 : -1;
  return [...patients].sort((a, b) => {
    const av = a[sort.key] ?? "";
    const bv = b[sort.key] ?? "";
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * factor;
    return String(av).localeCompare(String(bv)) * factor;
  });
}

const COLUMNS: Array<{ key: SortKey; label: string; className?: string }> = [
  { key: "id", label: "ID", className: "w-20" },
  { key: "name", label: "Name" },
  { key: "age", label: "Age", className: "w-20" },
  { key: "gender", label: "Gender", className: "hidden sm:table-cell" },
  { key: "disease", label: "Condition", className: "hidden md:table-cell" },
];

export function PatientsTable({ patients, sort, onSortChange, onEdit, onDelete }: PatientsTableProps) {
  const header = (column: (typeof COLUMNS)[number]) => {
    if (!sort || !onSortChange) return column.label;
    const active = sort.key === column.key;
    const Icon = !active ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;
    return (
      <button
        type="button"
        className={cn("inline-flex items-center gap-1 hover:text-slate-900", active && "text-slate-900")}
        onClick={() =>
          onSortChange({
            key: column.key,
            direction: active && sort.direction === "asc" ? "desc" : "asc",
          })
        }
      >
        {column.label}
        <Icon className={cn("h-3.5 w-3.5", !active && "text-slate-300")} aria-hidden />
      </button>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50/60 text-xs font-medium uppercase tracking-wide text-slate-500">
          <tr>
            {COLUMNS.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn("px-5 py-3 font-medium", column.className)}
                aria-sort={
                  sort?.key === column.key ? (sort.direction === "asc" ? "ascending" : "descending") : undefined
                }
              >
                {header(column)}
              </th>
            ))}
            <th scope="col" className="hidden px-5 py-3 font-medium lg:table-cell">
              Type
            </th>
            <th scope="col" className="px-5 py-3 text-right font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {patients.map((patient) => (
            <tr key={patient.id} className="hover:bg-slate-50/70">
              <td className="px-5 py-3 tabular-nums text-slate-500">#{patient.id}</td>
              <td className="max-w-[14rem] px-5 py-3">
                <Link to={`/patients/${patient.id}`} className="block truncate font-medium text-slate-900 hover:text-brand-700">
                  {patient.name}
                </Link>
              </td>
              <td className="px-5 py-3 tabular-nums text-slate-700">{patient.age}</td>
              <td className="hidden px-5 py-3 text-slate-700 sm:table-cell">{patient.gender}</td>
              <td className="hidden max-w-[14rem] truncate px-5 py-3 text-slate-700 md:table-cell">
                {patient.disease || <span className="text-slate-400">—</span>}
              </td>
              <td className="hidden px-5 py-3 lg:table-cell">
                <Badge tone={patient.patient_type === "Minor" ? "amber" : "neutral"}>{patient.patient_type}</Badge>
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-1">
                  <Link
                    to={`/patients/${patient.id}`}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`View ${patient.name}`}
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(patient)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      aria-label={`Edit ${patient.name}`}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(patient)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${patient.name}`}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
