export const GENDERS = ["Male", "Female", "Other"] as const;
export type Gender = (typeof GENDERS)[number];

// Mirrors the JSON returned by PatientSchema in app/schemas.py.
// `address` is required by the schema but is NOT stored in the database:
// the routers always return { city: "Unknown", state: "Unknown" }.
export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: Gender;
  disease: string | null;
  guardian_name: string | null;
  address: { city: string; state: string };
  patient_type: "Adult" | "Minor"; // computed field (age >= 18)
}

// Fields the user can actually edit and that the database persists.
export interface PatientInput {
  id: number;
  name: string;
  age: number;
  gender: Gender;
  disease?: string | null;
  guardian_name?: string | null;
}

// Query parameters accepted by GET /patients.
export interface PatientFilters {
  name?: string;
  gender?: Gender | "";
  age?: number;
  skip?: number;
  limit?: number; // backend allows 1..100, default 10
}
