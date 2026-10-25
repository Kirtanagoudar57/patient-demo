import { patientService } from "./patientService";
import type { Gender, Patient } from "../types/patient";
import { GENDERS } from "../types/patient";

export interface CountItem {
  label: string;
  count: number;
}

export interface PatientStats {
  total: number;
  adults: number;
  minors: number;
  withCondition: number;
  byGender: Record<Gender, number>;
  byAgeGroup: CountItem[];
  topConditions: CountItem[];
  latest: Patient[];
}

const AGE_GROUPS: Array<{ label: string; min: number; max: number }> = [
  { label: "0–17", min: 0, max: 17 },
  { label: "18–29", min: 18, max: 29 },
  { label: "30–44", min: 30, max: 44 },
  { label: "45–59", min: 45, max: 59 },
  { label: "60–74", min: 60, max: 74 },
  { label: "75+", min: 75, max: Infinity },
];

// Every number on the dashboard is computed from real GET /patients data.
// The backend has no aggregate endpoint, so the aggregation happens here.
export function computeStats(patients: Patient[]): PatientStats {
  const byGender = Object.fromEntries(GENDERS.map((g) => [g, 0])) as Record<Gender, number>;
  const conditions = new Map<string, CountItem>();
  let adults = 0;
  let withCondition = 0;

  for (const p of patients) {
    if (p.age >= 18) adults++;
    if (p.gender in byGender) byGender[p.gender]++;
    const disease = p.disease?.trim();
    if (disease) {
      withCondition++;
      const key = disease.toLowerCase();
      const entry = conditions.get(key) ?? { label: disease, count: 0 };
      entry.count++;
      conditions.set(key, entry);
    }
  }

  const byAgeGroup = AGE_GROUPS.map((group) => ({
    label: group.label,
    count: patients.filter((p) => p.age >= group.min && p.age <= group.max).length,
  }));

  const topConditions = [...conditions.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 6);

  // There is no created_at column, so "latest" means the highest IDs.
  const latest = [...patients].sort((a, b) => b.id - a.id).slice(0, 5);

  return {
    total: patients.length,
    adults,
    minors: patients.length - adults,
    withCondition,
    byGender,
    byAgeGroup,
    topConditions,
    latest,
  };
}

export const dashboardService = {
  async getPatientStats(): Promise<PatientStats> {
    const patients = await patientService.listAll();
    return computeStats(patients);
  },
};
