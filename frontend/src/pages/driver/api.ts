import { apiFetch } from "../../api/client";

export type Job = {
  id: number;
  company_id: number;
  date: string;
  vehicle_id: number;
  driver_id: number;
  job_type: string;
  from_location: string;
  to_location: string;
  trip_count: number;
  income_amount: string | null;
  fuel_amount: string | null;
  odometer_start: number | null;
  odometer_end: number | null;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
};

export const driverApi = {
  jobs: {
    list: () => apiFetch<Job[]>("/jobs"),
    create: (p: any) => apiFetch<Job>("/jobs", { method: "POST", body: JSON.stringify(p) })
  }
};

