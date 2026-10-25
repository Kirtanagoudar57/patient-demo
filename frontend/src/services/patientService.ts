import { api } from "./api";
import type { Patient, PatientFilters, PatientInput } from "../types/patient";

// The backend's max page size for GET /patients.
export const MAX_PAGE_SIZE = 100;

// PatientSchema requires an `address`, but the database does not store it and
// every response returns this same placeholder. We send the placeholder so the
// request validates, and the UI does not offer address fields that would not be saved.
const ADDRESS_PLACEHOLDER = { city: "Unknown", state: "Unknown" };

function toPayload(input: PatientInput) {
  return {
    id: input.id,
    name: input.name.trim(),
    age: input.age,
    gender: input.gender,
    disease: input.disease?.trim() || null,
    guardian_name: input.guardian_name?.trim() || null,
    address: ADDRESS_PLACEHOLDER,
  };
}

function toParams(filters: PatientFilters) {
  const params: Record<string, string | number> = {};
  if (filters.name?.trim()) params.name = filters.name.trim();
  if (filters.gender) params.gender = filters.gender;
  if (typeof filters.age === "number" && !Number.isNaN(filters.age)) params.age = filters.age;
  if (filters.skip) params.skip = filters.skip;
  if (filters.limit) params.limit = filters.limit;
  return params;
}

// All routes live under the router prefix "/patients" and require a bearer token.
export const patientService = {
  /** GET /patients?name=&gender=&age=&skip=&limit= */
  async list(filters: PatientFilters = {}): Promise<Patient[]> {
    const { data } = await api.get<Patient[]>("/patients", { params: toParams(filters) });
    return data;
  },

  /**
   * Fetches every patient by walking through pages of MAX_PAGE_SIZE.
   * Used for dashboard statistics because the backend has no count/stats endpoint.
   */
  async listAll(maxPages = 50): Promise<Patient[]> {
    const all: Patient[] = [];
    for (let page = 0; page < maxPages; page++) {
      const batch = await patientService.list({ skip: page * MAX_PAGE_SIZE, limit: MAX_PAGE_SIZE });
      all.push(...batch);
      if (batch.length < MAX_PAGE_SIZE) break;
    }
    return all;
  },

  /** GET /patients/{id} */
  async get(id: number): Promise<Patient> {
    const { data } = await api.get<Patient>(`/patients/${id}`);
    return data;
  },

  /** POST /patients (409 if the ID already exists) */
  async create(input: PatientInput): Promise<Patient> {
    const { data } = await api.post<Patient>("/patients", toPayload(input));
    return data;
  },

  /** PUT /patients/{id} (full replacement of the editable fields) */
  async update(id: number, input: PatientInput): Promise<Patient> {
    const { data } = await api.put<Patient>(`/patients/${id}`, toPayload({ ...input, id }));
    return data;
  },

  /** DELETE /patients/{id} */
  async remove(id: number): Promise<void> {
    await api.delete(`/patients/${id}`);
  },
};
