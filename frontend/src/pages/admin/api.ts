import { apiFetch } from "../../api/client";

export type Vehicle = { id: number; plate: string; vehicle_type: string; is_active: boolean };
export type Driver = { id: number; company_id: number; name: string; phone: string; role: "driver"; is_active: boolean };
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
  description: string | null;
};
export type Expense = {
  id: number;
  company_id: number;
  date: string;
  vehicle_id: number;
  expense_type: string;
  amount: string;
  description: string | null;
};

export type Dashboard = {
  total_trip_count: number;
  total_income: string | null;
  total_expense: string;
  net_profit: string | null;
  active_vehicle_count: number;
};

export type VehicleReportRow = {
  vehicle_id: number;
  plate: string;
  vehicle_type: string;
  total_trip_count: number;
  total_income: string | null;
  total_expense: string;
  net_profit: string | null;
};

export type DriverReportRow = {
  driver_id: number;
  name: string;
  phone: string;
  job_count: number;
  total_trip_count: number;
  total_income: string | null;
};

export type TimeSeriesRow = {
  granularity: "daily" | "weekly" | "monthly";
  period_start: string;
  period_end: string;
  total_trip_count: number;
  total_income: string | null;
  total_expense: string;
  net_profit: string | null;
};

export const adminApi = {
  vehicles: {
    list: () => apiFetch<Vehicle[]>("/admin/vehicles"),
    create: (p: { plate: string; vehicle_type: string }) =>
      apiFetch<Vehicle>("/admin/vehicles", { method: "POST", body: JSON.stringify(p) }),
    update: (id: number, p: { plate?: string; vehicle_type?: string; is_active?: boolean }) =>
      apiFetch<Vehicle>(`/admin/vehicles/${id}`, { method: "PUT", body: JSON.stringify(p) }),
    delete: (id: number) =>
      apiFetch<Vehicle>(`/admin/vehicles/${id}`, { method: "PUT", body: JSON.stringify({ is_active: false }) })
  },
  drivers: {
    list: () => apiFetch<Driver[]>("/admin/drivers"),
    create: (p: { name: string; phone: string; password: string }) =>
      apiFetch<Driver>("/admin/drivers", { method: "POST", body: JSON.stringify(p) }),
    update: (id: number, p: { name?: string; phone?: string; password?: string; is_active?: boolean }) =>
      apiFetch<Driver>(`/admin/drivers/${id}`, { method: "PUT", body: JSON.stringify(p) }),
    delete: (id: number) =>
      apiFetch<Driver>(`/admin/drivers/${id}`, { method: "PUT", body: JSON.stringify({ is_active: false }) })
  },
  jobs: {
    list: () => apiFetch<Job[]>("/jobs"),
    create: (p: any) => apiFetch<Job>("/jobs", { method: "POST", body: JSON.stringify(p) }),
    update: (id: number, p: any) =>
      apiFetch<Job>(`/jobs/${id}`, { method: "PUT", body: JSON.stringify(p) })
  },
  expenses: {
    list: () => apiFetch<Expense[]>("/admin/expenses"),
    create: (p: any) => apiFetch<Expense>("/admin/expenses", { method: "POST", body: JSON.stringify(p) }),
    update: (id: number, p: any) =>
      apiFetch<Expense>(`/admin/expenses/${id}`, { method: "PUT", body: JSON.stringify(p) })
  },
  dashboard: (p: { start_date: string; end_date: string }) =>
    apiFetch<Dashboard>(`/admin/dashboard?start_date=${p.start_date}&end_date=${p.end_date}`),
  reports: {
    vehicles: (p: { start_date: string; end_date: string; vehicle_id?: number; driver_id?: number }) => {
      const qs = new URLSearchParams({ start_date: p.start_date, end_date: p.end_date });
      if (p.vehicle_id) qs.set("vehicle_id", String(p.vehicle_id));
      if (p.driver_id) qs.set("driver_id", String(p.driver_id));
      return apiFetch<VehicleReportRow[]>(`/admin/reports/vehicles?${qs.toString()}`);
    },
    drivers: (p: { start_date: string; end_date: string; vehicle_id?: number; driver_id?: number }) => {
      const qs = new URLSearchParams({ start_date: p.start_date, end_date: p.end_date });
      if (p.vehicle_id) qs.set("vehicle_id", String(p.vehicle_id));
      if (p.driver_id) qs.set("driver_id", String(p.driver_id));
      return apiFetch<DriverReportRow[]>(`/admin/reports/drivers?${qs.toString()}`);
    },
    timeSeries: (p: {
      start_date: string;
      end_date: string;
      granularity: "daily" | "weekly" | "monthly";
      vehicle_id?: number;
      driver_id?: number;
    }) => {
      const qs = new URLSearchParams({ start_date: p.start_date, end_date: p.end_date, granularity: p.granularity });
      if (p.vehicle_id) qs.set("vehicle_id", String(p.vehicle_id));
      if (p.driver_id) qs.set("driver_id", String(p.driver_id));
      return apiFetch<TimeSeriesRow[]>(`/admin/reports/time-series?${qs.toString()}`);
    }
  }
};

